"""Pydantic models for SecretFlow and SPU."""

from enum import IntEnum
from typing import List, Optional

from pydantic import BaseModel


class SPUNode(BaseModel):
    party: str

    listen_addr: str = ""
    """
    Network address for this node to bind to.

    If not specified, the node will bind to the same address as `address`.
    """

    address: str
    """Network address for other nodes to connect to this node."""


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
    fxp_fraction_bits: int = 0

    enable_action_trace: bool = False
    enable_type_checker: bool = False
    enable_pphlo_trace: bool = False
    enable_runtime_snapshot: bool = False
    snapshot_dump_dir: Optional[str] = None

    enable_pphlo_profile: bool = False
    enable_hal_profile: bool = False


class SPULogLevel(IntEnum):
    Debug = 0
    Info = 1
    Warn = 2
    Error = 3


class SPULogOptions(BaseModel):
    enable_console_logger: bool = True
    system_log_path: str = "spu.log"
    trace_log_path: Optional[str] = None
    log_level: SPULogLevel = SPULogLevel.Info

    max_log_file_size: int = 500 * 1024 * 1024
    max_log_file_count: int = 10
    trace_content_length: int = 100


class SPUClusterDef(BaseModel):
    nodes: List[SPUNode]
    runtime_config: SPURuntimeConfig


class SPUConfig(BaseModel):
    cluster_def: SPUClusterDef
    # FIXME: upstream accepts only proto objects. bad for marshalling.
    # log_options: SPULogOptions = Field(default_factory=SPULogOptions)
