from typing import Any, Callable, TypeVar, Union, overload

from secretflow.device.device.pyu import PYU, PYUObject
from secretflow.device.device.spu import SPU, SPUObject

T = TypeVar("T")


def use_cleartext(owner: PYU) -> Callable[[Any], PYUObject]:
    def wrapper(x):
        return owner(lambda x: x)(x)

    return wrapper


@overload
def use_relocation(owner: PYU, ref: PYUObject) -> Callable[[], PYUObject]:
    ...


@overload
def use_relocation(owner: PYU, ref: SPUObject) -> Callable[[], PYUObject]:
    ...


@overload
def use_relocation(owner: SPU, ref: PYUObject) -> Callable[[], SPUObject]:
    ...


def use_relocation(owner, ref):
    def wrapper():
        return ref.to(owner)

    return wrapper


@overload
def use_function(
    device: PYU,
    *args: PYUObject,
    **kwargs: PYUObject,
) -> Callable[[Union[Callable, None]], PYUObject]:
    ...


@overload
def use_function(
    device: SPU,
    *args: SPUObject,
    **kwargs: SPUObject,
) -> Callable[[Union[Callable, None]], SPUObject]:
    ...


def use_function(owner, *args, **kwargs):
    """
    Execute `fn` on `args` and `kwargs` in `device`, and return the device
    representation of the result.
    """

    def wrapper(fn: Callable):
        return owner(fn)(*args, **kwargs)

    return wrapper
