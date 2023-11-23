from typing import Dict, FrozenSet, Union

from pydantic import BaseModel, validate_arguments

from secretnote.formal.locations.utils import PortBinding


class SFConfigSimulation(BaseModel):
    pass


class SFConfigSimulationWithExternalRay(BaseModel):
    ray_address: str


class SFConfigNetworked(BaseModel):
    self_party: str
    ray_address: str
    network: Dict[str, PortBinding]


class SymbolicWorld(BaseModel):
    world: FrozenSet[str]

    @validate_arguments
    def reify(
        self,
        config: Union[
            SFConfigNetworked,
            SFConfigSimulationWithExternalRay,
            SFConfigSimulation,
        ],
    ):
        import secretflow

        if isinstance(config, SFConfigSimulation):
            secretflow.init(parties=[*self.world], address="local")
            return

        if isinstance(config, SFConfigSimulationWithExternalRay):
            secretflow.init(parties=[*self.world], address=config.ray_address)
            return

        parties = {}

        for k in self.world:
            addr = {"address": config.network[k].announced_as}
            if config.network[k].bind_to:
                addr["listen_addr"] = config.network[k].bind_to
            parties[k] = addr

        assert (
            config.self_party in parties
        ), f"party {config.self_party} not in {parties}"

        secretflow.init(
            address=config.ray_address,
            cluster_config={
                "parties": parties,
                "self_party": config.self_party,
            },
        )
