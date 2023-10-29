import builtins
import dis
import inspect
from collections import defaultdict
from collections.abc import Mapping, Sequence
from contextlib import suppress
from contextvars import ContextVar
from functools import wraps
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
    Set,
    Tuple,
    TypeVar,
    Union,
    cast,
    overload,
)

from typing_extensions import Concatenate, ParamSpec

from .models import (
    DeviceSnapshot,
    FrameSnapshot,
    FunctionSignature,
    FunctionSnapshot,
    LogicalLocation,
    MappingSnapshot,
    ObjectSnapshot,
    OpaqueTracedFrame,
    RemoteObjectSnapshot,
    SequenceSnapshot,
    SnapshotRef,
    SnapshotType,
    TracedFrame,
    UnboundSnapshot,
)

if TYPE_CHECKING:
    from secretflow.device.device import Device, DeviceObject

P = ParamSpec("P")
T = TypeVar("T")
U = TypeVar("U")


def fingerprint(obj: Any) -> str:
    from fed import FedObject
    from ray import ObjectRef
    from secretflow.device.device.heu_object import HEUObject
    from secretflow.device.device.pyu import PYUObject
    from secretflow.device.device.spu import SPUObject
    from secretflow.device.device.teeu import TEEUObject

    if isinstance(obj, FrameType):
        return f"python/frame/id/{hex(id(obj))}/line/{obj.f_lineno}"

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


def type_annotation(obj: Any) -> str:
    if getattr(obj, "__module__", None) == "typing":
        return str(obj)
    module_name, obj_name = qualname(obj)
    if module_name and obj_name:
        return f"{module_name}.{obj_name}"
    if obj_name:
        return obj_name
    return str(obj)


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


def break_circular_ref(
    fn: Callable[Concatenate[T, P], U]
) -> Callable[Concatenate[T, P], Union[U, SnapshotRef]]:
    @wraps(fn)
    def wrapper(obj: T, *args: P.args, **kwargs: P.kwargs):
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


def record(obj: Any) -> SnapshotType:
    from secretflow.device.device import Device, DeviceObject

    if isinstance(obj, Device):
        return record_device(obj)
    if isinstance(obj, DeviceObject):
        return record_device_object(obj)
    if inspect.isfunction(obj):
        return record_function(obj)
    if isinstance(obj, Mapping):
        return record_mapping(obj)
    if isinstance(obj, Sequence):
        if not isinstance(obj, (str, bytes, bytearray, memoryview)):
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
        kind = "PYU"
        parties = (device.party,)
        params = {}
    elif isinstance(device, SPU):
        kind = "SPU"
        parties = tuple(device.actors)
        params = {
            "protocol": device.conf.protocol,
            "field": device.conf.field,
            "fxp_fraction_bits": device.conf.fxp_fraction_bits,
        }
    elif isinstance(device, HEU):
        kind = "HEU"
        parties = (device.sk_keeper_name(), *device.evaluator_names())
        params = {
            "mode": device.config["mode"],
            "encoding": device.config.get("encoding"),
        }
    elif isinstance(device, TEEU):
        kind = "TEEU"
        parties = (device.party,)
        params = {}
    else:
        return record_object(device)
    return DeviceSnapshot(
        type=type_name(device),
        id=fingerprint(device),
        location=LogicalLocation(kind=kind, parties=parties, parameters=params),
    )


@break_circular_ref
def record_device_object(obj: "DeviceObject"):
    from secretflow.device.device import HEUObject, PYUObject, SPUObject, TEEUObject

    device_snapshot = record_device(obj.device)
    if not isinstance(device_snapshot, DeviceSnapshot):
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
        values=[record(value) for value in obj],
    )


@break_circular_ref
def record_mapping(obj: Mapping):
    return MappingSnapshot(
        type=type_name(obj),
        id=fingerprint(obj),
        hash=hash_digest(obj),
        snapshot=snapshot(obj),
        values={json_key(key): record(value) for key, value in obj.items()},
    )


def record_parameter(param: inspect.Parameter):
    if param.annotation is not inspect.Parameter.empty:
        annotation = type_annotation(param.annotation)
    else:
        annotation = type_annotation(Any)
    return UnboundSnapshot(annotation=annotation)


def record_signature(sig: inspect.Signature):
    parameters = {
        name: record_parameter(param) for name, param in sig.parameters.items()
    }
    if sig.return_annotation is not inspect.Signature.empty:
        return_annotation = type_annotation(sig.return_annotation)
    else:
        return_annotation = type_annotation(Any)
    return FunctionSignature(
        parameters=parameters,
        return_annotation=UnboundSnapshot(annotation=return_annotation),
    )


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
                global_vars[name] = record(value)

    return global_vars


@break_circular_ref
def record_function(func: Union[Callable, CodeType]):
    if inspect.isfunction(func):
        module, name = qualname(func)
        signature = record_signature(inspect.signature(func, follow_wrapped=False))
        f_closures = inspect.getclosurevars(func).nonlocals
        f_globals = getattr(func, "__globals__", {})
    elif inspect.iscode(func):
        name = func.co_name or "<unknown>"
        module = inspect.getmodulename(func.co_filename)
        signature = None
        f_closures = {}
        f_globals = {}
    else:
        raise TypeError(f"Expected function or code, got {type(func)}")

    try:
        filename = source_path(inspect.getsourcefile(func))
    except Exception:
        filename = None

    try:
        sourcelines, firstlineno = inspect.getsourcelines(func)
        sourcelines = dedent("".join(sourcelines))
    except Exception:
        sourcelines = firstlineno = None

    closure_vars = {k: record(v) for k, v in f_closures.items()}
    global_vars = _record_globals(func, f_globals)

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
        closure_vars=closure_vars,
        global_vars=global_vars,
    )


def record_traceback(frame: FrameType):
    stack: List[FrameSnapshot] = []
    for f in inspect.getouterframes(frame):
        if f.code_context is None:
            code = None
        else:
            code = "".join(f.code_context).strip()
        stack.append(
            FrameSnapshot(
                id=fingerprint(f.frame),
                type=type_name(f.frame),
                filename=source_path(f.filename),
                lineno=f.lineno,
                func=f.function,
                code=code,
            )
        )
    return stack


def record_frame(frame: FrameType, func: Union[Callable, CodeType]):
    if inspect.isfunction(func):
        f_closures = inspect.getclosurevars(func).nonlocals
    elif inspect.iscode(func):
        name = func.co_name or "<unknown>"
        f_closures = {}
    else:
        raise TypeError(f"Expected function or code, got {type(func)}")

    f_locals = frame.f_locals
    f_globals = frame.f_globals

    local_vars: Dict[str, SnapshotType] = {}

    for name, value in f_locals.items():
        if name not in f_closures:
            local_vars[name] = record(value)

    global_vars = _record_globals(func, f_globals)
    traceback = record_traceback(frame)

    return TracedFrame(
        function=cast(FunctionSnapshot, record_function(func)),
        local_vars=local_vars,
        global_vars=global_vars,
        return_value=UnboundSnapshot(),
        traceback=traceback,
    )


class SnapshotCompressor:
    def __init__(self) -> None:
        self.spans: Dict[str, OpaqueTracedFrame] = {}
        self.locations: Set[LogicalLocation] = set()
        self.variables: Dict[str, Dict[int, SnapshotType]] = defaultdict(dict)
        self.object_refs: Dict[str, int] = {}

    @property
    def current_rank(self):
        return len(self.spans)

    def update(self, span_id: str, span: TracedFrame):
        local_vars = {key: self.record(item) for key, item in span.local_vars.items()}
        global_vars = {key: self.record(item) for key, item in span.global_vars.items()}
        return_value = self.record(span.return_value)
        function_ref = self.record(span.function)
        traceback = [self.record(item) for item in span.traceback]
        rank = self.current_rank
        result = OpaqueTracedFrame(
            semantics=span.semantics,
            function=function_ref,
            local_vars=local_vars,
            global_vars=global_vars,
            return_value=return_value,
            traceback=traceback,
        )
        self.spans[span_id] = result
        return rank, result

    @overload
    def record_object(self, data: UnboundSnapshot) -> UnboundSnapshot:
        ...

    @overload
    def record_object(self, data: SnapshotType) -> SnapshotRef:
        ...

    def record_object(self, data: SnapshotType):
        if isinstance(data, (SnapshotRef, UnboundSnapshot)):
            return data

        for existing in self.variables[data.id].values():
            if existing == data:
                return SnapshotRef(id=data.id)

        self.variables[data.id][self.current_rank] = data
        return SnapshotRef(id=data.id)

    def record_device(self, data: DeviceSnapshot):
        self.locations.add(data.location)
        return self.record_object(data)

    def record_remote_object(self, data: RemoteObjectSnapshot):
        if self.object_refs.get(data.id) is None:
            numbering = len(self.object_refs) + 1
            self.object_refs[data.id] = numbering
            self.locations.add(data.location)
        return self.record_object(data)

    def record_sequence(self, data: SequenceSnapshot):
        converted = data.copy()
        converted.values = [self.record(item) for item in data.values]
        return self.record_object(converted)

    def record_mapping(self, data: MappingSnapshot):
        converted = data.copy()
        converted.values = {key: self.record(item) for key, item in data.values.items()}
        return self.record_object(converted)

    def record_function(self, data: FunctionSnapshot):
        converted = data.copy()
        converted.closure_vars = {
            key: self.record(item) for key, item in data.closure_vars.items()
        }
        converted.global_vars = {
            key: self.record(item) for key, item in data.global_vars.items()
        }
        return self.record_object(converted)

    def record(self, data: SnapshotType):
        if isinstance(data, DeviceSnapshot):
            return self.record_device(data)
        if isinstance(data, RemoteObjectSnapshot):
            return self.record_remote_object(data)
        if isinstance(data, SequenceSnapshot):
            return self.record_sequence(data)
        if isinstance(data, MappingSnapshot):
            return self.record_mapping(data)
        if isinstance(data, FunctionSnapshot):
            return self.record_function(data)
        return self.record_object(data)


_snapshot_refs: ContextVar[set] = ContextVar("_snapshot_refs")
