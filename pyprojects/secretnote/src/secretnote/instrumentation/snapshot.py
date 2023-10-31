import builtins
import dis
import inspect
from collections import defaultdict
from contextlib import suppress
from pprint import pformat
from textwrap import dedent
from types import CodeType, FrameType, FunctionType
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
        try:
            self.refs[obj_id] = obj
        except TypeError:
            # cannot weakref this object
            return f"python/transient/{hex(obj_id)}"
        self.generations[obj_id] += 1
        return f"python/id/{hex(obj_id)}+{self.generations[obj_id]}"

    def reset(self) -> None:
        self.generations.clear()
        self.refs.clear()


id_tracker = LifetimeIdentityTracker()


def logical_location(device: Any) -> LogicalLocation:
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
        params = {}
    elif isinstance(device, TEEU):
        kind = "TEEU"
        parties = (device.party,)
        params = {}
    else:
        raise TypeError(f"Unknown device type {type(device)}")
    return LogicalLocation(kind=kind, parties=parties, parameters=params)


def find_globals(fn: Union[FunctionType, CodeType], ns: Dict):
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

    if isinstance(obj, inspect.FrameInfo):
        return fingerprint(obj.frame)
    if isinstance(obj, FrameType):
        return f"python/frame/id/{hex(id(obj))}/line/{obj.f_lineno}"
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
    return id_tracker.fingerprint(obj)


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


def to_string(obj: Any) -> str:
    for getter in (pformat, str, repr, fingerprint):
        with suppress(Exception):
            text = getter(obj)
            assert isinstance(text, str)
            return text
    return "<unserializable>"
