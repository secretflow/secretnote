"""Pydantic models for SecretFlow and SPU."""

from enum import IntEnum
from typing import List

from pydantic import BaseModel


class SPUNode(BaseModel):
    party: str
    address: str


class SPUProtocolKind(IntEnum):
    REF2K = 1
    SEMI2K = 2
    ABY3 = 3
    CHEETAH = 4


class SPUFieldType(IntEnum):
    FM32 = 1
    FM64 = 2
    FM128 = 3


class SPURuntimeConfig(BaseModel):
    protocol: SPUProtocolKind
    field: SPUFieldType


class SPUClusterDef(BaseModel):
    nodes: List[SPUNode]
    runtime_config: SPURuntimeConfig
