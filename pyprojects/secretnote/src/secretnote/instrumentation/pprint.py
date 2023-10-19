import inspect
from contextlib import suppress
from pprint import pformat
from textwrap import dedent
from typing import Any, Callable


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


def json_key(obj: Any, key_fn: Callable[[Any], str] = fingerprint):
    if obj is None:
        return None
    if isinstance(obj, (str, int, float, bool)):
        return obj
    return key_fn(obj)


def hash_digest(obj: Any) -> str:
    return f"python/hash/{hex(hash(obj))}"


def qualname(obj: Any) -> str:
    names = [
        getattr(obj, "__module__", None),
        getattr(obj, "__qualname__", None)
        or getattr(obj, "__name__", None)
        or getattr(obj, "co_name", None)
        or getattr(obj, "name", None),
    ]
    return ".".join(map(str, filter(None, names)))


def source_code(obj):
    with suppress(Exception):
        return dedent(inspect.getsource(obj))
    return None


def snapshot(obj: Any) -> str:
    for getter in (source_code, pformat, str, repr, fingerprint):
        with suppress(Exception):
            text = getter(obj)
            assert isinstance(text, str)
            return text
    return "<unserializable>"


def source_path(filename: str) -> str:
    from IPython.core.getipython import get_ipython
    from IPython.utils.path import compress_user

    ipy = get_ipython()

    if ipy is not None and (data := ipy.compile.format_code_name(filename)) is not None:
        label, name = data
        return f"{label} {name}"

    return compress_user(filename)
