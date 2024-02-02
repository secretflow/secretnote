import builtins
import dis
import inspect
from collections import defaultdict
from contextlib import suppress
from pprint import pformat
from textwrap import dedent
from types import CodeType, FrameType, FunctionType, MethodType, ModuleType
from typing import (
    Any,
    Callable,
    Dict,
    Hashable,
    Optional,
    Tuple,
    Union,
    overload,
)
from weakref import WeakValueDictionary

from opentelemetry import trace

from secretnote.formal.symbols import LogicalLocation


class LifetimeIdentityTracker:
    def __init__(self) -> None:
        self.generations: Dict[int, int] = defaultdict(int)
        self.refs: WeakValueDictionary[int, Any] = WeakValueDictionary()

    def fingerprint(self, obj: Any) -> str:
        obj_id = id(obj)
        if obj_id in self.refs:
            # still alive
            return f"python/id/{hex(obj_id)}+{self.generations[obj_id]}"
        # first object with this ID, or ID reused
        # after a previous object was garbage collected
        self.refs[obj_id] = obj
        # will throw if object cannot be weakref'd
        self.generations[obj_id] += 1
        return f"python/id/{hex(obj_id)}+{self.generations[obj_id]}"

    def reset(self) -> None:
        self.generations.clear()
        self.refs.clear()


id_tracker = LifetimeIdentityTracker()


def logical_location(device: Any) -> LogicalLocation:
    from secretflow.device.device import HEU, PYU, SPU, TEEU

    if isinstance(device, PYU):
        type_ = "PYU"
        parties = (device.party,)
        params = {}

    elif isinstance(device, SPU):
        from libspu.spu_pb2 import FieldType, ProtocolKind

        type_ = "SPU"
        parties = tuple(device.actors)
        params = {
            "protocol": ProtocolKind.Name(device.conf.protocol),
            "field": FieldType.Name(device.conf.field),
            "fxp_fraction_bits": device.conf.fxp_fraction_bits,
        }

    elif isinstance(device, HEU):
        type_ = "HEU"
        parties = (device.sk_keeper_name(), *device.evaluator_names())
        params = {}

    elif isinstance(device, TEEU):
        type_ = "TEEU"
        parties = (device.party,)
        params = {}

    else:
        raise TypeError(f"Unknown device type {type(device)}")

    return LogicalLocation(type=type_, parties=parties, parameters=params)


def find_globals(fn: Union[FunctionType, MethodType, CodeType], ns: Dict):
    global_vars = {}
    # https://stackoverflow.com/a/61964607/22226623
    for inst in dis.get_instructions(fn):
        if inst.opname == "LOAD_GLOBAL":
            name = inst.argval
            try:
                value = ns[name]
            except KeyError:
                continue
            if getattr(builtins, name, None) is value:
                continue
            global_vars[name] = value
    return global_vars


def fingerprint(obj: Any) -> str:
    from fed import FedObject
    from ray import ObjectRef
    from secretflow.device.device import (
        Device,
        HEUObject,
        PYUObject,
        SPUObject,
        TEEUObject,
    )

    if obj is None:
        return "python/none"

    if isinstance(obj, Device):
        return f"secretflow/location/{logical_location(obj).as_key()}"
    if isinstance(obj, ObjectRef):
        return f"ray/objectref/{obj}"
    if isinstance(obj, FedObject):
        return f"rayfed/{fingerprint(obj.get_ray_object_ref())}"
    if isinstance(obj, PYUObject):
        return f"secretflow/object/python/{fingerprint(obj.data)}"
    if isinstance(obj, SPUObject):
        return f"secretflow/object/mpc/{fingerprint(obj.meta)}"
    if isinstance(obj, HEUObject):
        return f"secretflow/object/homomorphic/{fingerprint(obj.data)}"
    if isinstance(obj, TEEUObject):
        return f"secretflow/object/tee/{fingerprint(obj.data)}"

    try:
        return id_tracker.fingerprint(obj)
    except TypeError:
        pass

    span_id = hex(trace.get_current_span().get_span_context().span_id)
    if isinstance(obj, FrameType):
        obj_id = f"frame/{hex(id(obj))}/line/{obj.f_lineno}"
    elif isinstance(obj, inspect.FrameInfo):
        obj_id = f"frame/{hex(id(obj.frame))}/line/{obj.frame.f_lineno}"
    else:
        obj_id = f"id/{hex(id(obj))}"
    return f"otel/span/{span_id}/transient/{obj_id}"


@overload
def hash_digest(obj: CodeType) -> str: ...


@overload
def hash_digest(obj: Hashable) -> str: ...


@overload
def hash_digest(obj: Any) -> Optional[str]: ...


def hash_digest(obj):
    try:
        return f"python/hash/{hex(hash(obj))}"
    except Exception:
        return None


def bytecode_hash(f: Any) -> str:
    if not inspect.isfunction(f):
        raise TypeError(f"Expected Python function, got {type(f)}")
    return hash_digest(f.__code__.co_code)


def json_key(obj: Any, key_fn: Callable[[Any], str] = fingerprint):
    if obj is None:
        return None
    if isinstance(obj, (str, int, float, bool)):
        return obj
    return key_fn(obj)


def qualname_tuple(obj: Any) -> Tuple[Optional[str], Optional[str]]:
    module_name = getattr(inspect.getmodule(obj), "__name__", None)
    obj_name = (
        getattr(obj, "__qualname__", None)
        or getattr(obj, "__name__", None)
        or getattr(obj, "co_name", None)
        or getattr(obj, "name", None)
    )
    return module_name, obj_name


def qualname(obj: Any) -> str:
    if isinstance(obj, ModuleType):
        return obj.__name__
    module_name, obj_name = qualname_tuple(obj)
    return f"{module_name or '<unknown_module>'}.{obj_name or '<unknown>'}"


def type_annotation(obj: Any) -> str:
    if obj is inspect.Parameter.empty:
        return type_annotation(Any)
    if getattr(obj, "__module__", None) == "typing":
        return str(obj)
    module_name, obj_name = qualname_tuple(obj)
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
def source_path(filename: str) -> str: ...


@overload
def source_path(filename: None) -> None: ...


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


def to_string(obj: Any) -> str:
    for getter in (pformat, str, repr, fingerprint):
        with suppress(Exception):
            text = getter(obj)
            assert isinstance(text, str)
            return text
    return "<unserializable>"
