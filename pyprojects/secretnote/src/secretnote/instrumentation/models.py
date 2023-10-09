import re
from types import FrameType
from typing import Callable, Dict, Optional

from pydantic import BaseModel
from typing_extensions import TypeAlias

from secretnote.formal.symbols import Function


class ProfilerRule(BaseModel):
    file: re.Pattern
    func_name: re.Pattern
    semantics: Optional[Callable[[FrameType], Function]] = None


class SourceLocation(BaseModel):
    file: str
    line: int


class Variable(BaseModel):
    name: str
    snapshot: str


Reference: TypeAlias = str
ReferenceMap = Dict[Reference, Variable]


class CallTrace(BaseModel):
    call: SourceLocation

    boundvars: ReferenceMap
    freevars: ReferenceMap
    retval: Reference

    semantics: Optional[Function] = None
