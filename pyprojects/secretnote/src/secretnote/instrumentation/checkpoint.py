from types import FrameType
from typing import Callable, Dict, Optional, TypeVar

from .pprint import hash_digest
from .types import Checkpoint, QualifiedCallable

T = TypeVar("T", bound=Callable)


class CheckpointCollection:
    def __init__(self):
        self.checkpoints: Dict[str, Checkpoint] = {}

    def match(self, frame: FrameType) -> Optional[Checkpoint]:
        return self.checkpoints.get(hash_digest(frame.f_code))

    def add_function(
        self,
        fn: QualifiedCallable,
        *,
        api_level: Optional[int] = None,
        description: Optional[str] = None,
    ):
        ckpt = Checkpoint.from_callable(fn)
        ckpt.api_level = api_level
        ckpt.description = description
        self.checkpoints[ckpt.digest] = ckpt

    def tracing_checkpoint(self, api_level: int, description: Optional[str] = None):
        def decorator(fn: T) -> T:
            self.add_function(fn, api_level=api_level, description=description)
            return fn

        return decorator


DEFAULT_CHECKPOINTS = CheckpointCollection()

tracing_checkpoint = DEFAULT_CHECKPOINTS.tracing_checkpoint
