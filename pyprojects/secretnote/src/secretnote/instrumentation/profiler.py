import contextvars
import inspect
import sys
from types import FrameType
from typing import Any, Callable, List, Optional, Tuple
from weakref import WeakValueDictionary

from opentelemetry import trace
from opentelemetry.context import Context
from pydantic import BaseModel

from .checkpoint import (
    DEFAULT_CHECKPOINTS,
    Checkpoint,
    CheckpointCollection,
    CheckpointInfo,
)
from .envvars import OTEL_PYTHON_SECRETNOTE_TRACING_CALL
from .snapshot import FunctionSnapshot, fingerprint, snapshot_tree, source_path


class SourceLocation(BaseModel):
    filename: str
    lineno: int
    func: str
    code: Optional[str]

    @classmethod
    def from_frame(cls, frame: FrameType):
        stack: List[cls] = []
        for f in inspect.getouterframes(frame):
            if f.code_context is None:
                code = None
            else:
                code = "".join(f.code_context)
            stack.append(
                cls(
                    filename=source_path(f.filename),
                    lineno=f.lineno,
                    func=f.function,
                    code=code,
                )
            )
        return stack


class Invocation(BaseModel):
    checkpoint: CheckpointInfo
    snapshot: FunctionSnapshot
    stack: List[SourceLocation]


class Profiler:
    def __init__(
        self,
        checkpoints: CheckpointCollection = DEFAULT_CHECKPOINTS,
        context: Optional[Context] = None,
    ):
        self.checkpoints = checkpoints
        self.parent_context = context

        self.tracer = trace.get_tracer(__name__)

        self._ctx_stack: List[Tuple[Context, Invocation]] = []
        self._session_tokens: List[contextvars.Token] = []
        self._retvals: WeakValueDictionary[str, Callable] = WeakValueDictionary()

    def __call__(self, frame: FrameType, event: str, arg: Any):
        if not (checkpoint := self.checkpoints.match(frame)):
            return

        if event == "call":
            self._stack_push(checkpoint, frame)
            return

        if event == "return":
            self._stack_pop(arg)
            return

    def _stack_peek(self) -> Tuple[Optional[Context], Optional[Invocation]]:
        if self._ctx_stack:
            return self._ctx_stack[-1]
        return self.parent_context, None

    def _stack_push(self, checkpoint: Checkpoint, frame: FrameType):
        ctx, _ = self._stack_peek()
        if checkpoint.func:
            snapshot = FunctionSnapshot.from_function(checkpoint.func, frame)
        elif func := self._retvals.get(fingerprint(frame.f_code)):
            snapshot = FunctionSnapshot.from_function(func, frame)
        else:
            snapshot = FunctionSnapshot.from_code(frame.f_code, frame)
        invocation = Invocation(
            checkpoint=checkpoint.info,
            snapshot=snapshot,
            stack=SourceLocation.from_frame(frame),
        )
        fn = invocation.snapshot
        span_name = f"{fn.module or '<unknown_module>'}.{fn.name}"
        span_name = ".".join(reversed(span_name.split(".")))
        span = self.tracer.start_span(span_name, ctx)
        ctx = trace.set_span_in_context(span, ctx)
        self._ctx_stack.append((ctx, invocation))

    def _track_retval(self, retval: Any):
        if not inspect.isfunction(retval):
            return
        self._retvals[fingerprint(retval.__code__)] = retval

    def _stack_pop(self, retval: Any):
        if not self._ctx_stack:
            return
        ctx, call = self._ctx_stack.pop()
        self._track_retval(retval)
        call.snapshot.retval = snapshot_tree(retval)
        span = trace.get_current_span(ctx)
        payload = call.json(by_alias=True, exclude_none=True)
        span.set_attribute(OTEL_PYTHON_SECRETNOTE_TRACING_CALL, payload)
        span.end()

    def start(self):
        self._session_tokens.append(current_profiler.set(self))
        sys.setprofile(self)

    def stop(self):
        sys.setprofile(None)
        if self._session_tokens:
            current_profiler.reset(self._session_tokens.pop())

    def __enter__(self):
        self.start()
        return self

    def __exit__(self, *args):
        self.stop()
        return False


current_profiler = contextvars.ContextVar[Profiler]("current_profiler")
