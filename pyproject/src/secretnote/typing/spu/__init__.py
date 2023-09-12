"""Pydantic models for SecretFlow and SPU."""

from typing import List

from libspu import spu_pb2 as spu_proto
from libspu.spu_pb2 import RuntimeConfig
from pydantic import BaseModel, validator

spu_proto = spu_proto


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
