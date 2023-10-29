import builtins
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
    Optional,
    Tuple,
    Union,
    overload,
)

from .models import (
    FunctionSignature,
    FunctionSnapshot,
    MappingSnapshot,
    ObjectSnapshot,
    RemoteLocationSnapshot,
    RemoteObjectSnapshot,
    SequenceSnapshot,
    SnapshotRef,
    SnapshotType,
    SourceLocation,
    UnboundSnapshot,
)

if TYPE_CHECKING:
    from secretflow.device.device import Device, DeviceObject


def fingerprint(obj: Any) -> str:
    from fed import FedObject
    from ray import ObjectRef
    from secretflow.device.device.heu_object import HEUObject
    from secretflow.device.device.pyu import PYUObject
    from secretflow.device.device.spu import SPUObject
    from secretflow.device.device.teeu import TEEUObject

    if isinstance(obj, ObjectRef):
        return f"ray/{obj}"

    if isinstance(obj, FedObject):
        return f"rayfed/{fingerprint(obj.get_ray_object_ref())}"

    if isinstance(obj, PYUObject):
        return f"secretflow/python/{fingerprint(obj.data)}"

    if isinstance(obj, SPUObject):
        return f"secretflow/mpc/{fingerprint(obj.meta)}"

    if isinstance(obj, HEUObject):
        return f"secretflow/homomorphic/{fingerprint(obj.data)}"

    if isinstance(obj, TEEUObject):
        return f"secretflow/tee/{fingerprint(obj.data)}"

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


def break_circular_ref(fn):
    @wraps(fn)
    def wrapper(obj, *args, **kwargs):
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
            result = fn(obj, *args, **kwargs)
            refs.discard(ref)
            return result
        finally:
            if token:
                refs.clear()
                _snapshot_refs.reset(token)

    return wrapper


def dispatch_snapshot(obj: Any) -> SnapshotType:
    from secretflow.device.device import Device, DeviceObject

    if isinstance(obj, Device):
        return record_device(obj)
    if isinstance(obj, DeviceObject):
        return record_device_object(obj)
    if inspect.isfunction(obj):
        return record_function(obj)
    if isinstance(obj, Mapping):
        return record_mapping(obj)
    if isinstance(obj, Sequence) and not isinstance(obj, str):
        return record_sequence(obj)
    return record_object(obj)


@break_circular_ref
def record_object(obj: Any):
    return ObjectSnapshot(
        type=type_name(obj),
        id=fingerprint(obj),
        hash=hash_digest(obj),
        snapshot=snapshot(obj),
    )


@break_circular_ref
def record_device(device: "Device"):
    from secretflow.device.device import HEU, PYU, SPU, TEEU

    if isinstance(device, PYU):
        location = ("PYU", device.party)
    elif isinstance(device, SPU):
        location = ("SPU", *device.actors)
    elif isinstance(device, HEU):
        location = ("HEU", device.sk_keeper_name(), *device.evaluator_names())
    elif isinstance(device, TEEU):
        location = ("TEE", device.party)
    else:
        return record_object(device)
    return RemoteLocationSnapshot(
        type=type_name(device),
        id=fingerprint(device),
        location=location,
    )


@break_circular_ref
def record_device_object(obj: "DeviceObject"):
    from secretflow.device.device import HEUObject, PYUObject, SPUObject, TEEUObject

    device_snapshot = record_device(obj.device)
    if not isinstance(device_snapshot, RemoteLocationSnapshot):
        return record_object(obj)
    if isinstance(obj, PYUObject):
        refs = (fingerprint(obj.data),)
    elif isinstance(obj, SPUObject):
        refs = (fingerprint(obj.meta), *map(fingerprint, obj.shares_name))
    elif isinstance(obj, HEUObject):
        refs = (fingerprint(obj.data),)
    elif isinstance(obj, TEEUObject):
        refs = (fingerprint(obj.data),)
    else:
        return record_object(obj)
    return RemoteObjectSnapshot(
        type=type_name(obj),
        id=fingerprint(obj),
        location=device_snapshot.location,
        refs=refs,
    )


@break_circular_ref
def record_sequence(obj: Sequence):
    return SequenceSnapshot(
        type=type_name(obj),
        id=fingerprint(obj),
        hash=hash_digest(obj),
        snapshot=snapshot(obj),
        values=[dispatch_snapshot(value) for value in obj],
    )


@break_circular_ref
def record_mapping(obj: Mapping):
    return MappingSnapshot(
        type=type_name(obj),
        id=fingerprint(obj),
        hash=hash_digest(obj),
        snapshot=snapshot(obj),
        values={json_key(key): dispatch_snapshot(value) for key, value in obj.items()},
    )


@break_circular_ref
def record_parameter(param: inspect.Parameter):
    if param.annotation is not inspect.Parameter.empty:
        annotation = str(param.annotation)
    else:
        annotation = str(Any)
    if param.default is not inspect.Parameter.empty:
        default = dispatch_snapshot(param.default)
    else:
        default = None
    return UnboundSnapshot(annotation=annotation, default=default)


def _record_globals(code: Union[Callable, CodeType], global_ns: Dict):
    global_vars: Dict[str, SnapshotType] = {}

    # https://stackoverflow.com/a/61964607/22226623
    for inst in dis.get_instructions(code):
        if inst.opname == "LOAD_GLOBAL":
            name = inst.argval
            try:
                value = global_ns[name]
            except KeyError:
                if hasattr(builtins, name):
                    continue
                global_vars[name] = UnboundSnapshot()
            else:
                global_vars[name] = dispatch_snapshot(value)

    return global_vars


@break_circular_ref
def record_function(func: Callable, frame: Optional[FrameType] = None):
    try:
        filename = source_path(inspect.getsourcefile(func))
    except Exception:
        filename = None

    try:
        sourcelines, firstlineno = inspect.getsourcelines(func)
        sourcelines = dedent("".join(sourcelines))
    except Exception:
        sourcelines = firstlineno = None

    sig = inspect.signature(func, follow_wrapped=False)

    signature = FunctionSignature(
        parameters={
            name: record_parameter(param) for name, param in sig.parameters.items()
        },
        return_annotation=UnboundSnapshot(annotation=str(sig.return_annotation)),
    )

    local_vars: Dict[str, SnapshotType] = {}
    closure_vars: Dict[str, SnapshotType] = {}

    if frame:
        f_locals = frame.f_locals
        f_globals = frame.f_globals
    else:
        f_locals = {}
        f_globals = getattr(func, "__globals__", {})

    f_closures = inspect.getclosurevars(func).nonlocals

    for name, value in f_locals.items():
        if name not in f_closures:
            local_vars[name] = dispatch_snapshot(value)

    for name, value in f_closures.items():
        closure_vars[name] = dispatch_snapshot(value)

    global_vars = _record_globals(func, f_globals)

    module, name = qualname(func)

    return FunctionSnapshot(
        id=fingerprint(func),
        hash=hash_digest(func),
        type=type_name(func),
        name=name or "<unknown>",
        module=module,
        filename=filename,
        firstlineno=firstlineno,
        source=sourcelines,
        docstring=inspect.getdoc(func),
        signature=signature,
        local_vars=local_vars,
        closure_vars=closure_vars,
        global_vars=global_vars,
        return_value=UnboundSnapshot(),
    )


@break_circular_ref
def record_code(code: CodeType, frame: Optional[FrameType] = None):
    if frame:
        f_locals = frame.f_locals
        f_globals = frame.f_globals
    else:
        f_locals = {}
        f_globals = {}

    local_vars: Dict[str, SnapshotType] = {}
    closure_vars: Dict[str, SnapshotType] = {}

    for name in chain(code.co_varnames, code.co_cellvars):
        try:
            value = f_locals[name]
            local_vars[name] = dispatch_snapshot(value)
        except KeyError:
            local_vars[name] = UnboundSnapshot()

    for name in chain(code.co_freevars, code.co_names):
        try:
            value = f_locals[name]
            closure_vars[name] = dispatch_snapshot(value)
        except KeyError:
            closure_vars[name] = UnboundSnapshot()

    global_vars = _record_globals(code, f_globals)

    return FunctionSnapshot(
        id=fingerprint(code),
        hash=hash_digest(code),
        type=type_name(code),
        name=code.co_name or "<unknown>",
        module=inspect.getmodulename(code.co_filename),
        filename=source_path(code.co_filename),
        firstlineno=code.co_firstlineno,
        source=source_code(code),
        docstring=inspect.getdoc(code),
        local_vars=local_vars,
        closure_vars=closure_vars,
        global_vars=global_vars,
        return_value=UnboundSnapshot(),
    )


def record_stackframes(frame: FrameType):
    stack: List[SourceLocation] = []
    for f in inspect.getouterframes(frame):
        if f.code_context is None:
            code = None
        else:
            code = "".join(f.code_context).strip()
        stack.append(
            SourceLocation(
                filename=source_path(f.filename),
                lineno=f.lineno,
                func=f.function,
                code=code,
            )
        )
    return stack


_snapshot_refs: ContextVar[set] = ContextVar("_snapshot_refs")
