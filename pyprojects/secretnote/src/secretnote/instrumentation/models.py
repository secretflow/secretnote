import abc
import inspect
from datetime import datetime
from textwrap import dedent
from types import FrameType, FunctionType, ModuleType
from typing import (
    Callable,
    Dict,
    List,
    Literal,
    Mapping,
    Optional,
    Sequence,
    Tuple,
    Union,
)

from opentelemetry.util.types import Attributes
from pydantic import BaseModel, Field
from typing_extensions import Annotated

from secretnote.formal.symbols import LogicalLocation
from secretnote.utils.pydantic import (
    LookupProxy,
    Reference,
    ReferenceMap,
    update_forward_refs,
)

from .snapshot import (
    find_globals,
    fingerprint,
    logical_location,
    qualname,
    qualname_tuple,
    source_path,
    to_string,
    type_annotation,
)


class ObjectTracer(abc.ABC):
    @classmethod
    @abc.abstractmethod
    def typecheck(cls, x) -> bool:
        ...

    @classmethod
    @abc.abstractmethod
    def trace(cls, x) -> "SnapshotType":
        ...

    @classmethod
    def tree(cls, x) -> Dict[str, Union[List, Dict]]:
        return {}


class ObjectSnapshot(ObjectTracer, LookupProxy):
    kind: Literal["object"] = "object"
    type: str
    snapshot: str

    @classmethod
    def typecheck(cls, x) -> bool:
        return isinstance(x, object)

    @classmethod
    def trace(cls, x) -> "SnapshotType":
        return ObjectSnapshot(type=qualname(type(x)), snapshot=to_string(x))

    @classmethod
    def none(cls):
        return cls.trace(None)


class ListSnapshot(ObjectTracer, LookupProxy):
    kind: Literal["list"] = "list"
    type: str
    snapshot: str
    values: ReferenceMap = ReferenceMap.empty_list()

    @classmethod
    def typecheck(cls, x) -> bool:
        if isinstance(x, (str, bytes, bytearray, memoryview)):
            return False
        return isinstance(x, Sequence)

    @classmethod
    def trace(cls, x) -> "SnapshotType":
        return ListSnapshot(type=qualname(type(x)), snapshot=to_string(x))

    @classmethod
    def tree(cls, x) -> Dict[str, Union[Dict, List]]:
        return {"values": [*x]}


class DictSnapshot(ObjectTracer, LookupProxy):
    kind: Literal["dict"] = "dict"
    type: str
    snapshot: str
    values: ReferenceMap = ReferenceMap.empty_dict()

    @classmethod
    def typecheck(cls, x):
        return isinstance(x, Mapping)

    @classmethod
    def trace(cls, x) -> "SnapshotType":
        return DictSnapshot(type=qualname(type(x)), snapshot=to_string(x))

    @classmethod
    def tree(cls, x) -> Dict[str, Union[Dict, List]]:
        return {"values": {**x}}


class RemoteLocationSnapshot(ObjectTracer, LookupProxy):
    kind: Literal["remote_location"] = "remote_location"
    type: str
    location: LogicalLocation

    @classmethod
    def typecheck(cls, x):
        from secretflow.device.device import Device

        return isinstance(x, Device)

    @classmethod
    def trace(cls, x) -> "SnapshotType":
        from .snapshot import logical_location

        return RemoteLocationSnapshot(
            type=qualname(type(x)),
            location=logical_location(x),
        )


class RemoteObjectSnapshot(ObjectTracer, LookupProxy):
    kind: Literal["remote_object"] = "remote_object"
    type: str
    location: LogicalLocation
    refs: Tuple[str, ...]

    @classmethod
    def typecheck(cls, x) -> bool:
        from secretflow.device.device import DeviceObject

        return isinstance(x, DeviceObject)

    @classmethod
    def trace(cls, x):
        from secretflow.device.device import HEUObject, PYUObject, SPUObject, TEEUObject

        if isinstance(x, PYUObject):
            refs = (fingerprint(x.data),)
        elif isinstance(x, SPUObject):
            refs = (fingerprint(x.meta), *map(fingerprint, x.shares_name))
        elif isinstance(x, HEUObject):
            refs = (fingerprint(x.data),)
        elif isinstance(x, TEEUObject):
            refs = (fingerprint(x.data),)
        else:
            raise TypeError(f"Unknown device object type {type(x)}")
        location = logical_location(x.device)
        type_ = qualname(type(x))
        return RemoteObjectSnapshot(type=type_, location=location, refs=refs)


class FunctionParameter(BaseModel):
    name: str
    kind: inspect._ParameterKind
    annotation: Optional[str] = None


class FunctionSignature(BaseModel):
    parameters: List[FunctionParameter] = []
    return_annotation: Optional[str] = None


class FunctionSnapshot(ObjectTracer, LookupProxy):
    kind: Literal["function"] = "function"
    type: str

    module: Optional[str] = None
    name: str
    signature: Optional[FunctionSignature] = None
    filename: Optional[str] = None
    firstlineno: Optional[int] = None
    source: Optional[str] = None
    docstring: Optional[str] = None

    closure_vars: ReferenceMap = ReferenceMap.empty_dict()
    global_vars: ReferenceMap = ReferenceMap.empty_dict()

    @classmethod
    def typecheck(cls, x) -> bool:
        return inspect.isfunction(x)

    @classmethod
    def trace(cls, func: FunctionType) -> "SnapshotType":
        module, name = qualname_tuple(func)
        signature = cls._signature(inspect.signature(func, follow_wrapped=False))

        try:
            filename = source_path(inspect.getsourcefile(func))
        except Exception:
            filename = None

        try:
            sourcelines, firstlineno = inspect.getsourcelines(func)
            sourcelines = dedent("".join(sourcelines))
        except Exception:
            sourcelines = firstlineno = None

        return FunctionSnapshot(
            type=qualname(type(func)),
            name=name or "<unknown>",
            module=module,
            filename=filename,
            firstlineno=firstlineno,
            source=sourcelines,
            docstring=inspect.getdoc(func),
            signature=signature,
        )

    @classmethod
    def tree(cls, func: FunctionType) -> Dict[str, Union[Dict, List]]:
        return {
            "closure_vars": {**inspect.getclosurevars(func).nonlocals},
            "global_vars": find_globals(func, getattr(func, "__globals__", {})),
        }

    @classmethod
    def _signature(cls, sig: inspect.Signature):
        params = [
            FunctionParameter(
                name=p.name,
                kind=p.kind,
                annotation=type_annotation(p.annotation),
            )
            for p in sig.parameters.values()
        ]
        return_type = type_annotation(sig.return_annotation)
        return FunctionSignature(parameters=params, return_annotation=return_type)


class FrameInfoSnapshot(ObjectTracer, LookupProxy):
    kind: Literal["frame_info"] = "frame_info"
    type: str
    filename: str
    lineno: int
    func: str
    code: Optional[str]

    @classmethod
    def typecheck(cls, x) -> bool:
        return isinstance(x, inspect.FrameInfo)

    @classmethod
    def trace(cls, f: inspect.FrameInfo) -> "SnapshotType":
        if f.code_context is None:
            code = None
        else:
            code = "".join(f.code_context).strip()
        return FrameInfoSnapshot(
            type=qualname(type(f)),
            filename=source_path(f.filename),
            lineno=f.lineno,
            func=f.function,
            code=code,
        )


class FrameSnapshot(ObjectTracer, LookupProxy):
    kind: Literal["frame"] = "frame"
    type: str

    function: ReferenceMap = ReferenceMap.empty_dict()
    local_vars: ReferenceMap = ReferenceMap.empty_dict()
    global_vars: ReferenceMap = ReferenceMap.empty_dict()
    return_value: ReferenceMap = ReferenceMap.empty_list()
    outer_frames: ReferenceMap = ReferenceMap.empty_list()

    @classmethod
    def typecheck(cls, x) -> bool:
        return isinstance(x, FrameType)

    @classmethod
    def trace(cls, f: FrameType) -> "SnapshotType":
        return FrameSnapshot(type=qualname(type(f)))

    @classmethod
    def tree(cls, f: FrameType) -> Dict[str, Union[Dict, List]]:
        return {
            "local_vars": f.f_locals,
            "global_vars": find_globals(f.f_code, f.f_globals),
            "outer_frames": inspect.getouterframes(f),
        }


class ModuleTracer(ObjectTracer):
    @classmethod
    def typecheck(cls, x) -> bool:
        return isinstance(x, ModuleType)

    @classmethod
    def trace(cls, x):
        raise NotImplementedError


SnapshotType = Annotated[
    Union[
        ObjectSnapshot,
        ListSnapshot,
        DictSnapshot,
        RemoteObjectSnapshot,
        RemoteLocationSnapshot,
        FunctionSnapshot,
        FrameInfoSnapshot,
        FrameSnapshot,
    ],
    Field(discriminator="kind"),
]


class Semantics(BaseModel):
    api_level: Optional[int] = None
    description: Optional[str] = None


class TracedFrame(BaseModel):
    semantics: Semantics = Semantics()

    function: Reference
    frame: Reference
    retval: Reference

    values: Dict[str, SnapshotType]

    def get_function(self):
        return self.function.bind(FunctionSnapshot, self.values)

    def get_frame(self):
        return self.frame.bind(FrameSnapshot, self.values)

    def get_retval(self):
        return self.retval.bind(SnapshotType, self.values)


class Checkpoint(BaseModel):
    code_hash: str
    name: str
    function: Optional[Callable]
    semantics: Semantics = Semantics()


class LocalCallable(BaseModel):
    fn: Callable
    load_const: Tuple[int, ...] = ()


class OTelSpanContextDict(BaseModel):
    span_id: str
    trace_id: str
    trace_state: str


class OTelSpanStatusDict(BaseModel):
    status_code: str
    description: Optional[str] = None


class OTelSpanEventDict(BaseModel):
    name: str
    attributes: Attributes
    timestamp: datetime


class OTelSpanLinkDict(BaseModel):
    attributes: Attributes
    span_context: OTelSpanContextDict


class OTelSpanResourceDict(BaseModel):
    attributes: Attributes
    schema_url: str


class OTelSpanDict(BaseModel):
    name: str
    context: OTelSpanContextDict
    kind: str
    parent_id: Optional[str] = None
    start_time: datetime
    end_time: datetime
    status: Optional[OTelSpanStatusDict] = None
    attributes: Attributes
    events: List[OTelSpanEventDict]
    links: List[OTelSpanLinkDict]
    resource: OTelSpanResourceDict


update_forward_refs(globals())
