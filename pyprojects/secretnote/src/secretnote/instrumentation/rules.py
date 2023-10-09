import re
from types import FrameType, FunctionType
from typing import List, Tuple

from secretflow import PYU, SPU, DeviceObject

from secretnote.formal.symbols import IO, Function, FunctionArgument, Location

from .models import ProfilerRule


def semantics_pyu(frame: FrameType) -> Function:
    pyu: PYU = frame.f_locals["self"]
    fn: FunctionType = frame.f_locals["fn"]
    args: Tuple = frame.f_locals["args"]

    arguments: List[FunctionArgument] = []

    for x in args:
        if isinstance(x, DeviceObject):
            arguments.append(f"0x{id(x):x}")
        else:
            arguments.append(IO())

    result = Location(kind="PYU", parties=(pyu.party,))

    return Function(arguments=tuple(arguments), result=result, name=fn.__name__)


def semantics_move_spu(frame: FrameType) -> Function:
    spu: SPU = frame.f_locals["spu"]

    args: Tuple = (frame.f_locals["self"],)
    arguments: List[FunctionArgument] = []

    for x in args:
        if isinstance(x, DeviceObject):
            arguments.append(f"0x{id(x):x}")
        else:
            arguments.append(IO())

    result = Location(kind="SPU", parties=tuple(spu.actors.keys()))

    return Function(arguments=tuple(arguments), result=result, name="move")


RULE_SECRETFLOW_API = ProfilerRule(
    file=re.compile(r"^secretflow/.*"),
    func_name=re.compile(r".*"),
)

RULE_SECRETFLOW_SEMANTICS_PYU = ProfilerRule(
    file=re.compile(r"^secretflow/device/device/pyu\.py$"),
    func_name=re.compile(r"^wrapper$"),
    semantics=semantics_pyu,
)

RULE_SECRETFLOW_SEMANTICS_PYU_SPU = ProfilerRule(
    file=re.compile(r"^secretflow/device/kernels/pyu\.py$"),
    func_name=re.compile(r"^pyu_to_spu$"),
    semantics=semantics_move_spu,
)


DEFAULT_RULES = [
    RULE_SECRETFLOW_SEMANTICS_PYU,
    RULE_SECRETFLOW_SEMANTICS_PYU_SPU,
    RULE_SECRETFLOW_API,
]
