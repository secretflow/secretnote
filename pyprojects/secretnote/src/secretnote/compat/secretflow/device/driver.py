from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, validator


class SFClusterParty(BaseModel):
    address: str
    listen_addr: Optional[str] = None

    def export(self):
        return self.dict(exclude_none=True)


class SFClusterConfig(BaseModel):
    parties: Dict[str, SFClusterParty]
    self_party: str

    @validator("parties")
    def parties_not_empty(cls, v):
        if not v:
            raise ValueError("parties must not be empty")
        return v

    @validator("self_party")
    def self_party_in_parties(cls, v, values):
        if v not in values["parties"]:
            raise ValueError(f"self_party {v} not in parties")
        return v


class SFConfigSimulationFullyManaged(BaseModel):
    """
    Config to start SecretFlow in a **fully-managed simulation mode**.

    In this mode, the program starts and manages its own Ray instance. Tasks for each
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

    @validator("parties")
    def validate_parties(cls, v: List[str]):
        if not v:
            raise ValueError("parties must not be empty")
        if len(v) != len(set(v)):
            raise ValueError("parties must be unique")
        return v


class SFConfigSimulationExternalRayInstance(BaseModel):
    pass
