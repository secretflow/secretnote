from types import FrameType
from typing import Callable, Dict, Optional, TypeVar

from .models import FunctionCheckpoint, FunctionInfo, Semantics
from .snapshot import hash_digest

T = TypeVar("T", bound=Callable)


class CheckpointGroup:
    def __init__(self):
        self.checkpoints: Dict[str, FunctionCheckpoint] = {}

    def match_frame(self, frame: FrameType) -> Optional[FunctionCheckpoint]:
        return self.checkpoints.get(hash_digest(frame.f_code))

    def add_function(self, fn: Callable, *load_const: int, semantics: Semantics):
        function = FunctionInfo.from_static(fn, *load_const)
        ckpt = FunctionCheckpoint(function=function)
        ckpt.semantics = semantics
        self.checkpoints[ckpt.function.code_hash] = ckpt

    def tracing_checkpoint(self, semantics: Semantics):
        def decorator(fn: T) -> T:
            self.add_function(fn, semantics=semantics)
            return fn

        return decorator
