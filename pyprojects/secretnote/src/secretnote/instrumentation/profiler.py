import contextvars
import sys
from types import FrameType
from typing import Any, Dict, List, Mapping, Optional, Sequence, Tuple, Type, cast

from opentelemetry import trace
from opentelemetry.context import Context
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor

from secretnote.utils.pydantic import Reference, ReferenceMap

from .checkpoint import CheckpointCollection
from .envvars import OTEL_PYTHON_SECRETNOTE_PROFILER_FRAME
from .exporters import InMemorySpanExporter
from .models import (
    Checkpoint,
    ObjectSnapshot,
    ObjectTracer,
    SnapshotType,
    TracedFrame,
)
from .snapshot import fingerprint

_NONE_REFERENCE = Reference(ref=fingerprint(None))


def trace_object(obj: Any, tracers: List[Type[ObjectTracer]]):
    snapshots: Dict[str, SnapshotType] = {_NONE_REFERENCE.ref: ObjectSnapshot.none()}

    def snapshot_tree(root: Any) -> Optional[Reference]:
        for rule in tracers:
            if not rule.typecheck(root):
                continue

            ref = Reference(ref=fingerprint(root))

            if ref.ref in snapshots:
                return ref

            try:
                snapshot = rule.trace(root)
            except NotImplementedError:
                return None

            snapshots[ref.ref] = snapshot

            for key, items in rule.tree(root).items():
                if isinstance(items, Mapping):
                    refs = {k: snapshot_tree(v) for k, v in items.items()}
                    refs = {k: v for k, v in refs.items() if v is not None}
                elif isinstance(items, Sequence):
                    refs = [snapshot_tree(x) for x in items]
                    refs = [x for x in refs if x is not None]
                else:
                    raise TypeError(f"Cannot snapshot {type(items)}")
                collection = ReferenceMap.from_container(refs)
                setattr(snapshot, key, collection)

            return ref
        return None

    result = snapshot_tree(obj)

    if result is None:
        raise TypeError(f"Cannot snapshot {type(obj)}")

    return result, snapshots


class Profiler:
    def __init__(
        self,
        checkpoints: CheckpointCollection,
        recorders: List[Type[ObjectTracer]],
        context: Optional[Context] = None,
    ):
        self._checkpoints = checkpoints
        self._recorders = recorders

        self._tracer = trace.get_tracer(__name__)
        self._exporter: InMemorySpanExporter

        self._parent_context = context
        self._ctx_stack: List[Tuple[Context, TracedFrame]] = []
        self._session_tokens: List[contextvars.Token] = []

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

    def __call__(self, frame: FrameType, event: str, arg: Any):
        if not (checkpoint := self._checkpoints.match(frame)):
            return

        if event == "call":
            self._stack_push(frame, checkpoint)
            return

        if event == "return":
            self._stack_pop(frame, arg)
            return

    def _trace_objects(self, *objects: Any):
        refs: List[Reference] = []
        values: Dict[str, SnapshotType] = {}
        for obj in objects:
            ref, snapshots = trace_object(obj, self._recorders)
            refs.append(ref)
            values.update(snapshots)
        return refs, values

    def _stack_push(self, frame: FrameType, checkpoint: Checkpoint):
        if self._ctx_stack:
            ctx = self._ctx_stack[-1][0]
        else:
            ctx = self._parent_context

        (func_ref, frame_ref), values = self._trace_objects(checkpoint.function, frame)

        result = TracedFrame(
            semantics=checkpoint.semantics,
            function=func_ref,
            frame=frame_ref,
            retval=_NONE_REFERENCE,
            values=values,
        )

        span = self._tracer.start_span(checkpoint.name, ctx)
        ctx = trace.set_span_in_context(span, ctx)

        self._ctx_stack.append((ctx, result))

    def _stack_pop(self, frame: FrameType, retval: Any):
        if not self._ctx_stack:
            return

        ctx, call = self._ctx_stack.pop()

        (retval_ref,), values = self._trace_objects(retval)

        call.retval = retval_ref
        call.values.update(values)

        span = trace.get_current_span(ctx)
        payload = call.json(by_alias=True, exclude_none=True)
        span.set_attribute(OTEL_PYTHON_SECRETNOTE_PROFILER_FRAME, payload)
        span.end()

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
