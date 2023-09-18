from typing import Any, Callable, Optional, TypeVar, overload

from secretflow.device.device import DeviceObject
from secretflow.device.device.pyu import PYU, PYUObject
from secretflow.device.device.spu import SPU, SPUObject

T = TypeVar("T")


def fn(*args: int):
    return sum(args)


@overload
def use_term(device: PYU, data: Any = None) -> PYUObject:
    ...


@overload
def use_term(device: SPU, data: PYUObject) -> SPUObject:
    ...


def use_term(device, data=None):
    if isinstance(data, DeviceObject):
        return data.to(device)
    return device(lambda x: x)(data)  # type: ignore


@overload
def use_application(
    device: PYU,
    fn: Optional[Callable] = None,
    *args: PYUObject,
    **kwargs: PYUObject,
) -> PYUObject:
    ...


@overload
def use_application(
    device: SPU,
    fn: Optional[Callable] = None,
    *args: SPUObject,
    **kwargs: SPUObject,
) -> SPUObject:
    ...


def use_application(device, fn=lambda x: x, *args, **kwargs):
    return device(fn)(*args, **kwargs)
