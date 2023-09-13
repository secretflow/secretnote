"""Pydantic models for SecretFlow and SPU."""

from typing import List

from pydantic import BaseModel, validator

from libspu.spu_pb2 import RuntimeConfig


class SPUNode(BaseModel):
    party: str
    address: str


class SPUClusterDef(BaseModel):
    class Config:
        arbitrary_types_allowed = True

    nodes: List[SPUNode]
    runtime_config: RuntimeConfig

    @validator("runtime_config", pre=True)
    def validate_runtime_config(cls, v):
        if isinstance(v, dict):
            return RuntimeConfig(**v)
        elif isinstance(v, RuntimeConfig):
            return v
        raise ValueError("runtime_config must be a dict or RuntimeConfig")
