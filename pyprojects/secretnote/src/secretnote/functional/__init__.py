from typing import Any, Callable, TypeVar, overload

from secretflow.device.device import DeviceObject
from secretflow.device.device.pyu import PYU, PYUObject
from secretflow.device.device.spu import SPU, SPUObject

T = TypeVar("T")


@overload
def use_term(identity: PYU, variable: None = None) -> Callable[[Any], PYUObject]:
    ...


@overload
def use_term(identity: PYU, variable: DeviceObject) -> Callable[[], PYUObject]:
    ...


@overload
def use_term(identity: SPU, variable: PYUObject) -> Callable[[], SPUObject]:
    ...


def use_term(identity, variable=None):
    """
    Place `variable` in `device`, and return its device representation.

    If `variable` is None (not provided), it is assumed to be remote data.
    """
    if isinstance(variable, DeviceObject):

        def wrapper():
            return variable.to(identity)

        return wrapper

    def wrapper(x=None):
        return identity(lambda x: x)(x)

    return wrapper


@overload
def use_application(
    device: PYU,
    *args: PYUObject,
    **kwargs: PYUObject,
) -> Callable[[Callable], PYUObject]:
    ...


@overload
def use_application(
    device: SPU,
    *args: SPUObject,
    **kwargs: SPUObject,
) -> Callable[[Callable], SPUObject]:
    ...


def use_application(device, *args, **kwargs):
    """
    Execute `fn` on `args` and `kwargs` in `device`, and return the device
    representation of the result.
    """

    def wrapper(fn: Callable):
        return device(fn)(*args, **kwargs)

    return wrapper
