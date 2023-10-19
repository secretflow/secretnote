from __future__ import annotations

import enum
from types import CodeType, FrameType
from typing import Any, Callable, List, Optional, Protocol, Tuple, Union

from jax.tree_util import tree_flatten
from pydantic import BaseModel

from secretnote.formal.symbols import Function

from .pprint import hash_digest, qualname, source_path
from .tree_util import PyTreeSnapshot


def standardize_container(pytree: Any) -> List[Any]:
    leaves, tree = tree_flatten(pytree)

    subtrees: List[Any] = []
    idx_start = 0

    for subtree in tree.children():
        idx_end = idx_start + subtree.num_leaves
        subtree_leaves = leaves[idx_start:idx_end]
        subtrees.append(subtree.unflatten(subtree_leaves))
        idx_start = idx_end

    return subtrees


class SemanticsResolver(Protocol):
    def __call__(self, info: Invocation, frame: FrameType) -> Function:
        ...


class LocalCallable(BaseModel):
    fn: Callable
    load_const: Tuple[int, ...] = ()


QualifiedCallable = Union[Callable, LocalCallable]


class Checkpoint(BaseModel):
    name: str
    digest: str

    api_level: Optional[int] = None
    description: Optional[str] = None

    @classmethod
    def from_callable(cls, fn: QualifiedCallable):
        func_name: str = ""

        if isinstance(fn, LocalCallable):
            fn, load_const = fn.fn, fn.load_const
        else:
            load_const = ()

        try:
            code = fn.__code__

            for const in load_const:
                code = code.co_consts[const]
                func_name += f".<locals>.{qualname(code)}"

            assert isinstance(code, CodeType)

        except IndexError as e:
            raise TypeError(
                f"unsupported callable {fn} for tracing:"
                f" index {load_const} out of range in co_consts"
            ) from e

        except (AttributeError, TypeError, AssertionError) as e:
            raise TypeError(
                f"unsupported callable {fn} for tracing:" " cannot access code object"
            ) from e

        func_name = f"{qualname(fn)}{func_name}"
        func_name = ".".join(reversed(func_name.split(".")))

        return Checkpoint(name=func_name, digest=hash_digest(code))


class APILevel(enum.IntEnum):
    IMPLEMENTATION = 10
    INVARIANT = 20
    USERLAND = 90


class SourceLocation(BaseModel):
    file: str
    line: int

    @classmethod
    def from_stack(cls, frame: FrameType):
        stack: List[cls] = []
        curr_frame = frame
        while curr_frame:
            filename = source_path(curr_frame.f_code.co_filename)
            stack.append(cls(file=filename, line=curr_frame.f_lineno))
            curr_frame = curr_frame.f_back
        return stack


class Invocation(BaseModel):
    checkpoint: Checkpoint
    boundvars: PyTreeSnapshot = PyTreeSnapshot()
    freevars: PyTreeSnapshot = PyTreeSnapshot()
    retvals: PyTreeSnapshot = PyTreeSnapshot()
    source: Optional[str] = None
    stack: List[SourceLocation]
