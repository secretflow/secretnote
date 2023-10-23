import enum
from inspect import unwrap
from types import CodeType, FrameType
from typing import Callable, Dict, Optional, Tuple, TypeVar, Union

from pydantic import BaseModel

from .snapshot import hash_digest

T = TypeVar("T", bound=Callable)


class LocalCallable(BaseModel):
    fn: Callable
    load_const: Tuple[int, ...] = ()


QualifiedCallable = Union[Callable, LocalCallable]


class CheckpointInfo(BaseModel):
    api_level: Optional[int] = None
    description: Optional[str] = None


class Checkpoint(BaseModel):
    code_hash: str
    func: Optional[Callable]
    info: CheckpointInfo = CheckpointInfo()

    @classmethod
    def from_callable(cls, fn: QualifiedCallable):
        if isinstance(fn, LocalCallable):
            func, load_const = fn.fn, fn.load_const
        else:
            func = fn
            load_const = ()

        func = unwrap(func)

        try:
            code = func.__code__

            for const in load_const:
                code = code.co_consts[const]

            assert isinstance(code, CodeType)

        except IndexError as e:
            raise TypeError(
                f"unsupported callable {func} for tracing:"
                f" index {load_const} out of range in co_consts"
            ) from e

        except (AttributeError, TypeError, AssertionError) as e:
            raise TypeError(
                f"unsupported callable {func} for tracing:" " cannot access code object"
            ) from e

        code_digest = hash_digest(code)

        if isinstance(fn, LocalCallable):
            return Checkpoint(func=None, code_hash=code_digest)
        return Checkpoint(func=func, code_hash=code_digest)


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
        ckpt.info.api_level = api_level
        ckpt.info.description = description
        self.checkpoints[ckpt.code_hash] = ckpt

    def tracing_checkpoint(self, api_level: int, description: Optional[str] = None):
        def decorator(fn: T) -> T:
            self.add_function(fn, api_level=api_level, description=description)
            return fn

        return decorator


DEFAULT_CHECKPOINTS = CheckpointCollection()

tracing_checkpoint = DEFAULT_CHECKPOINTS.tracing_checkpoint


class APILevel(enum.IntEnum):
    IMPLEMENTATION = 10
    INVARIANT = 20
    USERLAND = 90
