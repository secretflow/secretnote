from __future__ import annotations

import dis
import inspect
from collections.abc import Mapping, Sequence
from contextlib import suppress
from contextvars import ContextVar
from functools import wraps
from itertools import chain
from pprint import pformat
from textwrap import dedent
from types import CodeType, FrameType
from typing import (
    TYPE_CHECKING,
    Any,
    Callable,
    Dict,
    Hashable,
    List,
    Literal,
    Optional,
    Tuple,
    Union,
    overload,
)

from pydantic import BaseModel, Field
from typing_extensions import Annotated

if TYPE_CHECKING:
    from secretflow.device.device import Device, DeviceObject


JSONKey = Union[str, int, float, bool, None]


def fingerprint(obj: Any) -> str:
    from fed import FedObject
    from ray import ObjectRef
    from secretflow.device.device.heu_object import HEUObject
    from secretflow.device.device.pyu import PYUObject
    from secretflow.device.device.spu import SPUObject

    if isinstance(obj, ObjectRef):
        return f"ray/{obj}"

    if isinstance(obj, FedObject):
        return f"rayfed/{fingerprint(obj.get_ray_object_ref())}"

    if isinstance(obj, PYUObject):
        return f"secretflow/PYU/{fingerprint(obj.data)}"

    if isinstance(obj, SPUObject):
        return f"secretflow/SPU/{fingerprint(obj.meta)}"

    if isinstance(obj, HEUObject):
        return f"secretflow/HEU/{fingerprint(obj.data)}"

    return f"python/id/{hex(id(obj))}"


@overload
def hash_digest(obj: CodeType) -> str:
    ...


@overload
def hash_digest(obj: Hashable) -> str:
    ...


@overload
def hash_digest(obj: Any) -> Optional[str]:
    ...


def hash_digest(obj):
    try:
        return f"python/hash/{hex(hash(obj))}"
    except Exception:
        return None


def json_key(obj: Any, key_fn: Callable[[Any], str] = fingerprint):
    if obj is None:
        return None
    if isinstance(obj, (str, int, float, bool)):
        return obj
    return key_fn(obj)


def qualname(obj: Any) -> Tuple[Optional[str], Optional[str]]:
    module_name = getattr(inspect.getmodule(obj), "__name__", None)
    obj_name = (
        getattr(obj, "__qualname__", None)
        or getattr(obj, "__name__", None)
        or getattr(obj, "co_name", None)
        or getattr(obj, "name", None)
    )
    return module_name, obj_name


def type_name(obj: Any) -> str:
    module_name, obj_name = qualname(type(obj))
    return f"{module_name or '<unknown_module>'}.{obj_name or '<unknown>'}"


def source_code(obj):
    try:
        return dedent(inspect.getsource(obj))
    except Exception:
        return None


@overload
def source_path(filename: str) -> str:
    ...


@overload
def source_path(filename: None) -> None:
    ...


def source_path(filename: Optional[str]) -> Optional[str]:
    from IPython.core.getipython import get_ipython
    from IPython.utils.path import compress_user

    if filename is None:
        return None

    ipy = get_ipython()

    if ipy is not None and (data := ipy.compile.format_code_name(filename)) is not None:
        label, name = data
        return f"{label} {name}"

    return compress_user(filename)


def snapshot(obj: Any) -> str:
    for getter in (pformat, str, repr, fingerprint):
        with suppress(Exception):
            text = getter(obj)
            assert isinstance(text, str)
            return text
    return "<unserializable>"


_snapshot_refs: ContextVar[set] = ContextVar("_snapshot_refs")


def break_circular_ref(fn):
    @wraps(fn)
    def wrapper(self, obj, *args, **kwargs):
        try:
            refs = _snapshot_refs.get()
            token = None
        except LookupError:
            refs = set()
            token = _snapshot_refs.set(refs)
        try:
            ref = fingerprint(obj)
            if ref in refs:
                return SnapshotRef(id=ref)
            refs.add(ref)
            result = fn(self, obj, *args, **kwargs)
            refs.discard(ref)
            return result
        finally:
            if token:
                refs.clear()
                _snapshot_refs.reset(token)

    return wrapper


def snapshot_tree(obj: Any) -> SnapshotType:
    from secretflow.device.device import Device, DeviceObject

    if isinstance(obj, Device):
        return LocationSnapshot.from_device(obj)
    if isinstance(obj, DeviceObject):
        return RemoteObjectSnapshot.from_object(obj)
    if inspect.isfunction(obj):
        return FunctionSnapshot.from_function(obj)
    if isinstance(obj, Mapping):
        return MappingSnapshot.from_mapping(obj)
    if isinstance(obj, Sequence) and not isinstance(obj, str):
        return SequenceSnapshot.from_sequence(obj)
    return ObjectSnapshot.from_any(obj)


class SnapshotRef(BaseModel):
    kind: Literal["ref"] = "ref"
    id: str


ObjectLocation = Tuple[str, ...]


class ObjectSnapshot(BaseModel):
    kind: Literal["object"] = "object"
    type: str

    id: str
    hash: Optional[str]

    snapshot: str

    @classmethod
    def from_any(cls, obj: Any):
        return cls(
            type=type_name(obj),
            id=fingerprint(obj),
            hash=hash_digest(obj),
            snapshot=snapshot(obj),
        )


class LocationSnapshot(BaseModel):
    kind: Literal["remote_location"] = "remote_location"
    type: str

    id: str
    location: ObjectLocation

    @classmethod
    def from_device(cls, device: "Device"):
        from secretflow.device.device import HEU, PYU, SPU

        if isinstance(device, PYU):
            location = ("PYU", device.party)
        elif isinstance(device, SPU):
            location = ("SPU", *device.actors)
        elif isinstance(device, HEU):
            location = ("HEU", device.sk_keeper_name(), *device.evaluator_names())
        else:
            return ObjectSnapshot.from_any(device)
        return cls(type=type_name(device), id=fingerprint(device), location=location)


class RemoteObjectSnapshot(BaseModel):
    kind: Literal["remote_object"] = "remote_object"
    type: str

    id: str
    location: ObjectLocation

    @classmethod
    def from_object(cls, obj: "DeviceObject"):
        device_snapshot = LocationSnapshot.from_device(obj.device)
        if not isinstance(device_snapshot, LocationSnapshot):
            return ObjectSnapshot.from_any(obj)
        return cls(
            type=type_name(obj),
            id=fingerprint(obj),
            location=device_snapshot.location,
        )


class SequenceSnapshot(BaseModel):
    kind: Literal["sequence"] = "sequence"
    type: str

    id: str
    hash: Optional[str]

    snapshot: str
    values: List[SnapshotType]

    @classmethod
    @break_circular_ref
    def from_sequence(cls, obj: Sequence):
        return cls(
            type=type_name(obj),
            id=fingerprint(obj),
            hash=hash_digest(obj),
            snapshot=snapshot(obj),
            values=[snapshot_tree(value) for value in obj],
        )


class MappingSnapshot(BaseModel):
    kind: Literal["mapping"] = "mapping"
    type: str

    id: str
    hash: Optional[str]

    snapshot: str
    values: Dict[JSONKey, SnapshotType]

    @classmethod
    @break_circular_ref
    def from_mapping(cls, obj: Mapping):
        return cls(
            type=type_name(obj),
            id=fingerprint(obj),
            hash=hash_digest(obj),
            snapshot=snapshot(obj),
            values={json_key(key): snapshot_tree(value) for key, value in obj.items()},
        )


class UnboundSnapshot(BaseModel):
    kind: Literal["unbound"] = "unbound"
    annotation: str = str(Any)

    @classmethod
    @break_circular_ref
    def from_parameter(cls, param: inspect.Parameter):
        if param.annotation is inspect.Parameter.empty:
            return cls()
        return cls(annotation=str(param.annotation))


class FunctionSnapshot(BaseModel):
    kind: Literal["function"] = "function"
    type: str

    id: str
    hash: str
    module: Optional[str] = None
    name: str

    boundvars: Dict[str, SnapshotType]
    freevars: Dict[str, SnapshotType]
    retval: SnapshotType

    filename: Optional[str] = None
    firstlineno: Optional[int] = None
    source: Optional[str] = None
    docstring: Optional[str] = None

    @classmethod
    @break_circular_ref
    def from_function(cls, func: Callable, frame: Optional[FrameType] = None):
        try:
            filename = source_path(inspect.getsourcefile(func))
        except Exception:
            filename = None

        try:
            sourcelines, firstlineno = inspect.getsourcelines(func)
            sourcelines = dedent("".join(sourcelines))
        except Exception:
            sourcelines = firstlineno = None

        try:
            boundvars: Dict[str, SnapshotType] = {}

            sig = inspect.signature(func, follow_wrapped=False)

            for name, param in sig.parameters.items():
                if frame and name in frame.f_locals:
                    boundvars[name] = snapshot_tree(frame.f_locals[name])
                elif param.default is not inspect.Parameter.empty:
                    boundvars[name] = snapshot_tree(param.default)
                else:
                    boundvars[name] = UnboundSnapshot.from_parameter(param)

            if sig.return_annotation is not inspect.Signature.empty:
                retval = UnboundSnapshot(annotation=str(sig.return_annotation))
            else:
                retval = UnboundSnapshot()

        except Exception:
            boundvars = {}
            retval = UnboundSnapshot()

        try:
            freevars: Dict[str, SnapshotType] = {}

            closure = inspect.getclosurevars(func)

            for name, value in closure.nonlocals.items():
                freevars[name] = snapshot_tree(value)

            global_values = {**closure.builtins, **closure.globals}

            # https://stackoverflow.com/a/61964607/22226623
            for inst in dis.get_instructions(func):
                if inst.opname == "LOAD_GLOBAL":
                    name = inst.argval
                    try:
                        value = global_values[name]
                    except Exception:
                        continue
                    freevars[name] = snapshot_tree(value)

        except Exception:
            freevars = {}

        module, name = qualname(func)

        return cls(
            id=fingerprint(func),
            hash=hash_digest(func),
            type=type_name(func),
            name=name or "<unknown>",
            module=module,
            filename=filename,
            firstlineno=firstlineno,
            source=sourcelines,
            docstring=inspect.getdoc(func),
            boundvars=boundvars,
            freevars=freevars,
            retval=retval,
        )

    @classmethod
    @break_circular_ref
    def from_code(cls, code: CodeType, frame: Optional[FrameType] = None):
        if frame:
            variables = {**frame.f_builtins, **frame.f_globals, **frame.f_locals}
        else:
            variables = {}

        boundvars: Dict[str, SnapshotType] = {}

        for name in chain(code.co_varnames, code.co_cellvars):
            try:
                value = variables[name]
                boundvars[name] = snapshot_tree(value)
            except KeyError:
                boundvars[name] = UnboundSnapshot()

        freevars: Dict[str, SnapshotType] = {}

        for name in chain(code.co_freevars, code.co_names):
            try:
                value = variables[name]
                freevars[name] = snapshot_tree(value)
            except KeyError:
                freevars[name] = UnboundSnapshot()

        return cls(
            id=fingerprint(code),
            hash=hash_digest(code),
            type=type_name(code),
            name=code.co_name or "<unknown>",
            module=inspect.getmodulename(code.co_filename),
            filename=source_path(code.co_filename),
            firstlineno=code.co_firstlineno,
            source=source_code(code),
            docstring=inspect.getdoc(code),
            boundvars=boundvars,
            freevars=freevars,
            retval=UnboundSnapshot(),
        )

    # def update_locals(self, frame: FrameType):
    #     for name, value in frame.f_locals.items():
    #         self.boundvars[name] = snapshot_tree(value)

    def update_retval(self, retval: Any):
        self.retval = snapshot_tree(retval)

    def match(self, fn: Callable):
        module, name = qualname(fn)
        return self.module == module and self.name == name


class SourceLocation(BaseModel):
    filename: str
    lineno: int
    func: str
    code: Optional[str]

    @classmethod
    def from_frame(cls, frame: FrameType):
        stack: List[cls] = []
        for f in inspect.getouterframes(frame):
            if f.code_context is None:
                code = None
            else:
                code = "".join(f.code_context)
            stack.append(
                cls(
                    filename=source_path(f.filename),
                    lineno=f.lineno,
                    func=f.function,
                    code=code,
                )
            )
        return stack


class CheckpointInfo(BaseModel):
    api_level: Optional[int] = None
    description: Optional[str] = None


class Invocation(BaseModel):
    checkpoint: CheckpointInfo
    snapshot: FunctionSnapshot
    stackframes: List[SourceLocation]


SnapshotType = Annotated[
    Union[
        SnapshotRef,
        RemoteObjectSnapshot,
        LocationSnapshot,
        FunctionSnapshot,
        MappingSnapshot,
        SequenceSnapshot,
        ObjectSnapshot,
        UnboundSnapshot,
    ],
    Field(discriminator="kind"),
]

SnapshotMemo = Dict[str, SnapshotType]

SequenceSnapshot.update_forward_refs()
MappingSnapshot.update_forward_refs()
FunctionSnapshot.update_forward_refs()
