from typing import Dict, Type, Union, overload

from pydantic import BaseModel
from secretflow import PYU, SPU

SupportedDevices = Union[Type[PYU], Type[SPU]]


class OnDemandDevice:
    def __init__(self, world: Dict):
        self.world = world

    @overload
    def __call__(self, kind: Type[PYU], party: str, *parties: str) -> PYU:
        ...

    @overload
    def __call__(self, kind: Type[SPU], party: str, *parties: str) -> SPU:
        ...

    def __call__(self, kind: SupportedDevices, party: str, *parties: str):
        if kind is PYU:
            return PYU(party)
        if kind is SPU:
            expected_actors = {party, *parties}
            for variable in self.world.values():
                if isinstance(variable, SPU):
                    if expected_actors == set(variable.actors):
                        return variable
            raise ValueError(f"No suitable SPU found for {expected_actors}")


class PortBinding(BaseModel):
    announced_as: str
    bind_to: str = ""
