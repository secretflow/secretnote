import contextvars
import inspect
import sys
from types import FrameType
from typing import Any, Callable, List, Optional, Tuple
from weakref import WeakValueDictionary

from opentelemetry import trace
from opentelemetry.context import Context

from .checkpoint import DEFAULT_CHECKPOINTS, CheckpointCollection
from .envvars import OTEL_PYTHON_SECRETNOTE_TRACING_CALL
from .models import Checkpoint, Invocation
from .snapshot import (
    dispatch_snapshot,
    fingerprint,
    record_code,
    record_function,
    record_stackframes,
)


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
            self._stack_push(frame, checkpoint)
            return

        if event == "return":
            self._stack_pop(frame, arg)
            return

    def _stack_peek(self) -> Tuple[Optional[Context], Optional[Invocation]]:
        if self._ctx_stack:
            return self._ctx_stack[-1]
        return self.parent_context, None

    def _stack_push(self, frame: FrameType, checkpoint: Checkpoint):
        ctx, _ = self._stack_peek()
        if checkpoint.func:
            snapshot = record_function(checkpoint.func, frame)
        elif func := self._retvals.get(fingerprint(frame.f_code)):
            snapshot = record_function(func, frame)
        else:
            snapshot = record_code(frame.f_code, frame)
        invocation = Invocation(
            checkpoint=checkpoint.info,
            snapshot=snapshot,
            stackframes=record_stackframes(frame),
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

    def _stack_pop(self, frame: FrameType, retval: Any):
        if not self._ctx_stack:
            return
        ctx, call = self._ctx_stack.pop()
        self._track_retval(retval)
        call.snapshot.return_value = dispatch_snapshot(retval)
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
