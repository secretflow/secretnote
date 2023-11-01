import abc
import inspect
from datetime import datetime
from textwrap import dedent
from types import FrameType, FunctionType
from typing import (
    Any,
    Callable,
    Dict,
    Iterable,
    List,
    Literal,
    Mapping,
    Optional,
    Sequence,
    Tuple,
    Type,
    TypeVar,
    Union,
)

import stack_data.core
from opentelemetry.util.types import Attributes
from pydantic import BaseModel, Field
from typing_extensions import Annotated, override

from secretnote.formal.symbols import LogicalLocation
from secretnote.utils.pydantic import (
    ProxiedModel,
    Reference,
    ReferenceMap,
    to_flattened_pytree,
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

T = TypeVar("T", bound="SnapshotType")


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


class NoneSnapshot(ObjectTracer, Reference, ProxiedModel):
    kind: Literal["none"] = "none"

    @classmethod
    def typecheck(cls, x) -> bool:
        return x is None

    @classmethod
    def trace(cls, x) -> "SnapshotType":
        return NoneSnapshot(ref=fingerprint(x))


class ObjectSnapshot(ObjectTracer, Reference, ProxiedModel):
    kind: Literal["object"] = "object"
    type: str
    snapshot: str

    @classmethod
    def typecheck(cls, x) -> bool:
        return isinstance(x, object)

    @classmethod
    def trace(cls, x) -> "SnapshotType":
        return ObjectSnapshot(
            ref=fingerprint(x),
            type=qualname(type(x)),
            snapshot=to_string(x),
        )

    @classmethod
    def none(cls):
        return cls.trace(None)

    def __str__(self) -> str:
        return self.snapshot


class ListSnapshot(ObjectTracer, Reference, ProxiedModel):
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
        return ListSnapshot(
            ref=fingerprint(x),
            type=qualname(type(x)),
            snapshot=to_string(x),
        )

    @classmethod
    def tree(cls, x) -> Dict[str, Union[Dict, List]]:
        try:
            # namedtuple
            values = x._asdict()
            assert isinstance(values, dict)
            return {"values": {**values}}
        except Exception:
            pass
        return {"values": [*x]}

    @override
    def to_container(self, of_type: Type[T] = Any):
        return [v for k, v in self.values.of_type(of_type)]

    def __str__(self) -> str:
        return self.snapshot


class DictSnapshot(ObjectTracer, Reference, ProxiedModel):
    kind: Literal["dict"] = "dict"
    type: str
    snapshot: str
    values: ReferenceMap = ReferenceMap.empty_dict()

    @classmethod
    def typecheck(cls, x):
        return isinstance(x, Mapping)

    @classmethod
    def trace(cls, x) -> "SnapshotType":
        return DictSnapshot(
            ref=fingerprint(x),
            type=qualname(type(x)),
            snapshot=to_string(x),
        )

    @classmethod
    def tree(cls, x) -> Dict[str, Union[Dict, List]]:
        return {"values": {**x}}

    @override
    def to_container(self, of_type: Type[T] = Any):
        return {k: v for k, v in self.values.of_type(of_type)}

    def __str__(self) -> str:
        return self.snapshot


class RemoteLocationSnapshot(ObjectTracer, Reference, ProxiedModel):
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
            ref=fingerprint(x),
            type=qualname(type(x)),
            location=logical_location(x),
        )

    def __str__(self) -> str:
        return str(self.location)


class RemoteObjectSnapshot(ObjectTracer, Reference, ProxiedModel):
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

        return RemoteObjectSnapshot(
            ref=fingerprint(x),
            type=qualname(type(x)),
            location=logical_location(x.device),
            refs=refs,
        )

    def __str__(self) -> str:
        return f"{self.ref} @ {self.location}"


class FunctionParameter(BaseModel):
    name: str
    kind: inspect._ParameterKind
    annotation: Optional[str] = None


class FunctionSignature(BaseModel):
    parameters: List[FunctionParameter] = []
    return_annotation: Optional[str] = None

    def reconstruct(self) -> inspect.Signature:
        return inspect.Signature(
            parameters=[
                inspect.Parameter(
                    name=p.name,
                    kind=p.kind,
                    annotation=p.annotation,
                )
                for p in self.parameters
            ],
            return_annotation=self.return_annotation,
        )


class FunctionSnapshot(ObjectTracer, Reference, ProxiedModel):
    kind: Literal["function"] = "function"
    type: str

    module: Optional[str] = None
    name: str
    signature: Optional[FunctionSignature] = None
    filename: Optional[str] = None
    firstlineno: Optional[int] = None
    source: Optional[str] = None
    docstring: Optional[str] = None

    default_args: ReferenceMap = ReferenceMap.empty_dict()
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
            ref=fingerprint(func),
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
            "default_args": {
                k: p.default
                for k, p in inspect.signature(func).parameters.items()
                if p.default is not inspect.Parameter.empty
            },
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

    def __str__(self) -> str:
        if self.module and self.name:
            return f"{self.module}.{self.name}"
        return self.name


class FrameInfoSnapshot(ObjectTracer, Reference, ProxiedModel):
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
            ref=fingerprint(f),
            type=qualname(type(f)),
            filename=source_path(f.filename),
            lineno=f.lineno,
            func=f.function,
            code=code,
        )


class FrameSnapshot(ObjectTracer, Reference, ProxiedModel):
    kind: Literal["frame"] = "frame"
    type: str

    local_vars: ReferenceMap = ReferenceMap.empty_dict()
    global_vars: ReferenceMap = ReferenceMap.empty_dict()
    outer_frames: ReferenceMap = ReferenceMap.empty_list()

    module: Optional[str] = None
    func: str

    @classmethod
    def typecheck(cls, x) -> bool:
        return isinstance(x, FrameType)

    @classmethod
    def trace(cls, f: FrameType) -> "SnapshotType":
        info = stack_data.core.FrameInfo(f)
        module = inspect.getmodule(f.f_code)
        return FrameSnapshot(
            ref=fingerprint(f),
            type=qualname(type(f)),
            module=qualname(module),
            func=info.executing.code_qualname(),
        )

    @classmethod
    def tree(cls, f: FrameType) -> Dict[str, Union[Dict, List]]:
        return {
            "local_vars": f.f_locals,
            "global_vars": find_globals(f.f_code, f.f_globals),
            "outer_frames": inspect.getouterframes(f),
        }


SnapshotType = Annotated[
    Union[
        NoneSnapshot,
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
    assignments: Reference

    variables: Dict[str, SnapshotType]

    def get_function(self):
        return self.function.bind(FunctionSnapshot, self.variables)

    def get_function_name(self) -> str:
        try:
            func = self.get_function()
            module = func.module
            name = func.name
        except TypeError:
            info = self.get_frame()
            module = info.module
            name = info.func
        if not module:
            return name
        return f"{module}.{name}"

    def get_frame(self):
        return self.frame.bind(FrameSnapshot, self.variables)

    def iter_retvals(self) -> Iterable[Tuple[str, SnapshotType]]:
        try:
            assignments = self.assignments.bind(DictSnapshot, self.variables)
            for key, value in assignments.values.of_type(SnapshotType):
                yield key, value
        except TypeError:
            retval = self.retval.bind(SnapshotType, self.variables)
            for key, value in to_flattened_pytree(retval):
                yield key, value


class Checkpoint(BaseModel):
    code_hash: str
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
