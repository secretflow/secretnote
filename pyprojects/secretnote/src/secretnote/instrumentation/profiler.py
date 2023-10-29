import contextvars
import inspect
import sys
from types import FrameType
from typing import Any, Callable, List, Optional, Tuple, cast
from weakref import WeakValueDictionary

from opentelemetry import trace
from opentelemetry.context import Context
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor

from .checkpoint import DEFAULT_CHECKPOINTS, CheckpointCollection
from .envvars import OTEL_PYTHON_SECRETNOTE_TRACING_CALL
from .exporters import InMemorySpanExporter
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
        self._checkpoints = checkpoints

        self._tracer = trace.get_tracer(__name__)
        self._exporter: InMemorySpanExporter

        self._parent_context = context
        self._ctx_stack: List[Tuple[Context, Invocation]] = []
        self._session_tokens: List[contextvars.Token] = []
        self._retvals: WeakValueDictionary[str, Callable] = WeakValueDictionary()

    def __call__(self, frame: FrameType, event: str, arg: Any):
        if not (checkpoint := self._checkpoints.match(frame)):
            return

        if event == "call":
            self._stack_push(frame, checkpoint)
            return

        if event == "return":
            self._stack_pop(frame, arg)
            return

    def _stack_push(self, frame: FrameType, checkpoint: Checkpoint):
        if self._ctx_stack:
            ctx = self._ctx_stack[-1][0]
        else:
            ctx = self._parent_context

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
        span = self._tracer.start_span(span_name, ctx)
        ctx = trace.set_span_in_context(span, ctx)

        self._ctx_stack.append((ctx, invocation))

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

    def _track_retval(self, retval: Any):
        if not inspect.isfunction(retval):
            return
        self._retvals[fingerprint(retval.__code__)] = retval

    @property
    def exporter(self):
        try:
            exporter = self._exporter
        except AttributeError:
            exporter = self._exporter = InMemorySpanExporter()
            provider = cast(TracerProvider, trace.get_tracer_provider())
            processor = SimpleSpanProcessor(exporter)
            provider.add_span_processor(processor)
        return exporter

    def start(self):
        self.exporter.clear()
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
