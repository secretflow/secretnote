from typing import Dict, Type, Union, overload

from pydantic import BaseModel
from secretflow import HEU, PYU, SPU

SupportedDevices = Union[Type[PYU], Type[SPU], Type[HEU]]


class OnDemandDevice:
    def __init__(self, world: Dict):
        self.world = world

    @overload
    def __call__(self, kind: Type[PYU], party: str, *parties: str) -> PYU: ...

    @overload
    def __call__(self, kind: Type[SPU], party: str, *parties: str) -> SPU: ...

    @overload
    def __call__(self, kind: Type[HEU], party: str, *parties: str) -> HEU: ...

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
        if kind == HEU:
            private_key_owner = party
            public_key_evaluators = parties
            for variable in self.world.values():
                if isinstance(variable, HEU):
                    if (
                        private_key_owner == variable.sk_keeper_name()
                        and public_key_evaluators == tuple(variable.evaluator_names())
                    ):
                        return variable
            raise ValueError(
                "No suitable HEU found for "
                f"{private_key_owner} and {public_key_evaluators}"
            )


class PortBinding(BaseModel):
    announced_as: str
    bind_to: str = ""
