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
    Any,
    Callable,
    Dict,
    Hashable,
    List,
    Literal,
    Optional,
    Tuple,
    Union,
    cast,
    overload,
)

from pydantic import BaseModel, Field
from secretflow.device.device import (
    HEU,
    PYU,
    SPU,
    DeviceObject,
    HEUObject,
    PYUObject,
    SPUObject,
)
from typing_extensions import Annotated

JSONKey = Union[str, int, float, bool, None]


def fingerprint(obj: Any) -> str:
    from fed import FedObject
    from ray import ObjectRef
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
    with suppress(Exception):
        return dedent(inspect.getsource(obj))
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


SnapshotType = Annotated[
    Union[
        "SnapshotRef",
        "RemoteObjectSnapshot",
        "FunctionSnapshot",
        "MappingSnapshot",
        "SequenceSnapshot",
        "ObjectSnapshot",
        "UnboundSnapshot",
    ],
    Field(discriminator="kind"),
]

SnapshotMemo = Dict[str, SnapshotType]

_snapshot_refs: ContextVar[set] = ContextVar("_snapshot_refs")


def break_circular_ref(fn):
    @wraps(fn)
    def wrapper(cls, obj, *args, **kwargs):
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
            return fn(cls, obj, *args, **kwargs)
        finally:
            if token:
                _snapshot_refs.reset(token)

    return wrapper


def snapshot_tree(obj: Any) -> SnapshotType:
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


class RemoteObjectSnapshot(BaseModel):
    kind: Literal["remote_object"] = "remote_object"
    type: str

    id: str
    location: Tuple[str, ...]

    @classmethod
    def from_object(cls, obj: DeviceObject):
        if isinstance(obj, PYUObject):
            location = ("PYU", cast(PYU, obj.device).party)
        elif isinstance(obj, SPUObject):
            location = ("SPU", *cast(SPU, obj.device).actors)
        elif isinstance(obj, HEUObject):
            device = cast(HEU, obj.device)
            location = ("HEU", device.sk_keeper_name(), *device.evaluator_names())
        else:
            return ObjectSnapshot.from_any(obj)
        return cls(
            type=type_name(obj),
            id=fingerprint(obj),
            location=location,
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

            # https://stackoverflow.com/a/61964607/22226623
            for inst in dis.get_instructions(func):
                if inst.opname == "LOAD_GLOBAL":
                    name = inst.argval
                    try:
                        value = closure.globals[name]
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
        variables = {**frame.f_locals, **frame.f_globals} if frame else {}

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


SequenceSnapshot.update_forward_refs()
MappingSnapshot.update_forward_refs()
FunctionSnapshot.update_forward_refs()
