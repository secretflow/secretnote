from typing import Dict, Optional

from pydantic import BaseModel, validator


class SFClusterParty(BaseModel):
    address: str
    listen_addr: Optional[str] = None


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
