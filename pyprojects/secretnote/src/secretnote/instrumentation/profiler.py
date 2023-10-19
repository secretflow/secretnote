import contextvars
import sys
from types import FrameType
from typing import Any, List, Optional, Tuple

from opentelemetry import trace
from opentelemetry.context import Context

from .checkpoint import DEFAULT_CHECKPOINTS, CheckpointCollection
from .envvars import OTEL_PYTHON_SECRETNOTE_TRACING_CALL
from .pprint import function_source
from .tree_util import pytree_snapshot
from .types import Checkpoint, Invocation, SourceLocation


class _NameError:
    def __str__(self) -> str:
        return "!NameError!"


_NAME_ERROR = _NameError()


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

    def __call__(self, frame: FrameType, event: str, arg: Any):
        if not (checkpoint := self.checkpoints.match(frame)):
            return

        if event == "call":
            invocation = self._create_invocation(checkpoint, frame)
            self._stack_push(invocation)
            return

        _, curr_call = self._stack_peek()

        if curr_call and event == "return":
            curr_call.retvals = pytree_snapshot(arg)
            self._stack_pop()
            return

    def _create_invocation(self, checkpoint: Checkpoint, frame: FrameType):
        values = {**frame.f_globals, **frame.f_locals}
        boundvars = {
            k: values.get(k, _NAME_ERROR) for k in set(frame.f_code.co_varnames)
        }
        # TODO: this is insufficient for nested functions
        freevars = {
            k: values.get(k, _NAME_ERROR)
            for k in (set(frame.f_code.co_freevars) | set(frame.f_code.co_names))
            - set(frame.f_builtins)
        }
        invocation = Invocation(
            checkpoint=checkpoint,
            boundvars=pytree_snapshot(boundvars),
            freevars=pytree_snapshot(freevars),
            stack=SourceLocation.from_stack(frame),
            source=function_source(frame),
        )
        return invocation

    def _stack_push(self, invocation: Invocation):
        ctx, _ = self._stack_peek()
        span = self.tracer.start_span(invocation.checkpoint.name, ctx)
        ctx = trace.set_span_in_context(span, ctx)
        self._ctx_stack.append((ctx, invocation))

    def _stack_peek(self) -> Tuple[Optional[Context], Optional[Invocation]]:
        if self._ctx_stack:
            return self._ctx_stack[-1]
        return self.parent_context, None

    def _stack_pop(self):
        if not self._ctx_stack:
            return
        ctx, call = self._ctx_stack.pop()
        span = trace.get_current_span(ctx)
        payload = call.json(by_alias=True, exclude_none=True)
        span.set_attribute(OTEL_PYTHON_SECRETNOTE_TRACING_CALL, payload)
        exc_t, exc, tb = sys.exc_info()
        if exc:
            span.record_exception(exc.with_traceback(tb), escaped=True)
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
