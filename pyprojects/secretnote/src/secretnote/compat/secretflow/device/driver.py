from typing import Any, Collection, Dict, List, Literal, Optional

from pydantic import BaseModel, validator


def _validate_parties(v: Collection[str]):
    if not v:
        raise ValueError("parties must not be empty")
    if len(v) != len(set(v)):
        raise ValueError("parties must be unique")
    return v


class SFConfigSimulationFullyManaged(BaseModel):
    """
    Configure SecretFlow to start in simulation mode with a fully-managed Ray instance.

    In this mode, the program starts its own local Ray instance. Tasks for each
    participant are distributed among Ray workers (local processes).
    """

    parties: List[str]
    """Names of the participants."""

    address: Literal["local"] = "local"
    """
    Must be "local".

    This causes Ray to always start a new instance locally.

    See :ref:`ray.init`.
    """

    num_cpus: Optional[int] = None
    """
    Number of CPUs to allocate to each participant.

    See :ref:`ray.init`.
    """

    num_gpus: Optional[int] = None
    """
    Number of GPUs to allocate to each participant.

    See :ref:`ray.init`.
    """

    omp_num_threads: Optional[int] = None
    """
    See https://docs.ray.io/en/latest/ray-core/configure.html#cluster-resources
    """

    _validate_parties = validator("parties", allow_reuse=True)(_validate_parties)


class SFConfigSimulationExternalRay(BaseModel):
    """
    Configure SecretFlow to start in simulation mode with an external Ray instance.

    You are responsible for configuring your Ray instance with the appropriate resources
    and making sure it is accessible with the specified address.
    """

    parties: List[str]
    """Names of the participants."""

    address: str
    """
    Address of the Ray instance to connect to.
    """

    _validate_parties = validator("parties", allow_reuse=True)(_validate_parties)


class SFClusterParty(BaseModel):
    address: str

    listen_addr: Optional[str] = None

    # FIXME: This exists because upstream doesn't handle listen_addr=None gracefully.
    @validator("listen_addr", always=True)
    def _ensure_listen_addr_not_none(cls, v: Optional[str], values: Dict[str, Any]):
        if v is None:
            return values["address"]
        return v


class SFClusterConfig(BaseModel):
    parties: Dict[str, SFClusterParty]
    self_party: str

    _validate_parties = validator("parties", allow_reuse=True)(_validate_parties)

    @validator("self_party")
    def _self_party_in_parties(cls, v, values):
        if v not in values["parties"]:
            raise ValueError(f"self_party {v} not in parties")
        return v


class SFConfigNetworked(BaseModel):
    """
    Configure SecretFlow to start in networked (cluster) mode.

    In networked mode, participants communicate with each other strictly over the
    network, and manage their own Ray instances as well as all computing resources.

    You are responsible for configuring your network infrastructure (DNS, firewalls
    port-forwaring, etc.) to ensure connectivity between participants.
    """

    address: str
    """
    Address of the Ray instance to connect to.

    Note that this is **NOT** the address for cross-party communication, specified in
    :prop:`SFConfigNetworked.cluster_config`. The Ray instance address must be different
    from the cross-party communication address.
    """

    cluster_config: SFClusterConfig

    logging_level: Literal["debug", "info", "warning", "error", "critical"] = "info"
