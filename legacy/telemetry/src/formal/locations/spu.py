from enum import IntEnum
from typing import FrozenSet

from pydantic import BaseModel, validate_arguments

from .utils import PortBinding


class SPUProtocolKind(IntEnum):
    REF2K = 1
    SEMI2K = 2
    ABY3 = 3
    CHEETAH = 4


class SPUFieldType(IntEnum):
    FM32 = 1
    FM64 = 2
    FM128 = 3


class SymbolicSPU(BaseModel):
    world: FrozenSet[str]
    protocol: SPUProtocolKind
    field: SPUFieldType
    fxp_fraction_bits: int

    @validate_arguments
    def reify(self, **network: PortBinding):
        from secretflow.device.device.spu import SPU

        nodes = [
            {
                "party": party,
                "address": network[party].announced_as,
                "listen_addr": network[party].bind_to,
            }
            for party in self.world
        ]

        return SPU(
            cluster_def={
                "nodes": nodes,
                "runtime_config": {
                    "protocol": int(self.protocol),
                    "field": int(self.field),
                    "fxp_fraction_bits": self.fxp_fraction_bits,
                },
            },
        )
