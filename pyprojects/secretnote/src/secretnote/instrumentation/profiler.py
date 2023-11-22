import ast
import contextvars
import sys
from types import FrameType
from typing import (
    Any,
    Callable,
    Dict,
    List,
    Mapping,
    Optional,
    Sequence,
    Tuple,
    Type,
    cast,
)

import stack_data.core
from astunparse import unparse
from more_itertools import first_true
from opentelemetry import trace
from opentelemetry.context import Context
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor

from secretnote.utils.logging import log_dev_exception
from secretnote.utils.pydantic import Reference, ReferenceMap

from .checkpoint import CheckpointGroup
from .envvars import OTEL_PYTHON_SECRETNOTE_PROFILER_FRAME
from .exporters import InMemorySpanExporter
from .models import (
    FunctionCheckpoint,
    ObjectSnapshot,
    ObjectTracer,
    SnapshotType,
    TracedFrame,
)
from .snapshot import fingerprint, json_key

FinalizeSpan = Callable[[Optional[FrameType]], None]


class Profiler:
    def __init__(
        self,
        checkpoints: CheckpointGroup,
        recorders: List[Type[ObjectTracer]],
        context: Optional[Context] = None,
    ):
        self._checkpoints = checkpoints
        self._recorders = recorders

        self._tracer = trace.get_tracer(__name__)
        self._exporter: InMemorySpanExporter

        self._parent_context = context
        self._session_tokens: List[contextvars.Token] = []

        # most recent on the right
        self._recent_stacks: List[Tuple[Context, TracedFrame]] = []
        # most recent on the left
        self._recent_returns: List[FinalizeSpan] = []

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
        if not (checkpoint := self._checkpoints.match_frame(frame)):
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

    def _stack_push(self, frame: FrameType, checkpoint: FunctionCheckpoint):
        if self._recent_stacks:
            ctx = self._recent_stacks[-1][0]
        else:
            ctx = self._parent_context

        refs, values = self._trace_objects(checkpoint.function._origin, frame)
        func_ref, frame_ref = refs

        result = TracedFrame(
            checkpoint=checkpoint,
            function=func_ref,
            frame=frame_ref,
            retval=Reference(ref=fingerprint(None)),
            assignments=Reference(ref=fingerprint(None)),
            variables=values,
        )

        span = self._tracer.start_span(result.function_name, ctx)
        ctx = trace.set_span_in_context(span, ctx)

        self._recent_stacks.append((ctx, result))

    def _stack_pop(self, frame: FrameType, retval: Any):
        if not self._recent_stacks:
            return

        ctx, call = self._recent_stacks.pop()

        (retval_ref,), values = self._trace_objects(retval)
        call.retval = retval_ref
        call.variables.update(values)

        def end_current_span(f_back: Optional[FrameType]):
            try:
                if f_back and (named_values := trace_named_return(f_back, retval)):
                    named_values = {k.strip(): v for k, v in named_values.items()}
                    (refs,), values = self._trace_objects(named_values)
                    call.assignments = refs
                    call.variables.update(values)
            except Exception as e:
                log_dev_exception(e)
            span = trace.get_current_span(ctx)
            payload = call.json(by_alias=True, exclude_none=True)
            span.set_attribute(OTEL_PYTHON_SECRETNOTE_PROFILER_FRAME, payload)
            span.end()

        self._recent_returns.append(end_current_span)

        def end_remaining_spans(f_back: Optional[FrameType]):
            for fn in self._recent_returns:
                fn(f_back)
            self._recent_returns.clear()
            frame.f_trace_lines = False
            frame.f_trace = self._trace_noop

        def trace_line_in_outer_frame(frame: FrameType):
            if frame.f_back:
                frame.f_back.f_trace_lines = True
                frame.f_back.f_trace = trace_next_assignments
            else:
                # no more outer frame, finalize spans
                end_remaining_spans(None)

        def trace_next_assignments(f_back: FrameType, event: str, arg: None):
            if event == "return":
                # bubble up to outer frame
                trace_line_in_outer_frame(f_back)
                return None

            if event != "line":
                # wait for next line trace
                return trace_next_assignments

            end_remaining_spans(f_back)

        trace_line_in_outer_frame(frame)

    def _trace_noop(self, frame: FrameType, event: str, arg: Any):
        frame.f_trace_lines = False
        return self._trace_noop

    def start(self):
        self.exporter.clear()
        self._session_tokens.append(current_profiler.set(self))
        sys.settrace(self._trace_noop)
        sys.setprofile(self)

    def stop(self):
        sys.setprofile(None)
        sys.settrace(None)
        if self._session_tokens:
            current_profiler.reset(self._session_tokens.pop())

    def __enter__(self):
        self.start()
        return self

    def __exit__(self, *args):
        self.stop()
        return False

    def visualize(self):
        from secretnote.display.app import visualize_run

        return visualize_run(self)


def trace_object(obj: Any, tracers: List[Type[ObjectTracer]]):
    snapshots: Dict[str, SnapshotType] = {
        Reference(ref=fingerprint(None)).ref: ObjectSnapshot.none()
    }

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
                    refs = {json_key(k): v for k, v in refs.items() if v is not None}
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


def trace_named_return(frame: FrameType, retval: Any):
    retval_type = type(retval)

    info = stack_data.core.FrameInfo(frame)

    if retval_type is tuple or retval_type is list:
        # could be unpacking assignment, in which case there will be a different
        # tuple in the parent frame, then we will have to compare by elements
        #
        # we limit the supporting types to vanilla tuple/list
        # because we will need to iterate over it to determine item identity
        # and we want to avoid side effects in custom iterables

        def resolve_variables() -> Optional[Dict]:
            retval_len = len(retval)

            for expr, ast_nodes, value in cast(
                List[stack_data.core.Variable],
                info.variables,
            ):
                if value is retval:
                    # if it wasn't actually unpacked, return the entire iterable
                    return {expr: value}

                if (
                    isinstance(value, tuple)
                    and len(value) == retval_len
                    and all(a is b for a, b in zip(value, retval))
                ):
                    tuple_ast = cast(
                        Optional[ast.Tuple],
                        first_true(
                            ast_nodes,
                            pred=lambda x: isinstance(x, ast.Tuple),
                        ),
                    )

                    if tuple_ast and len(tuple_ast.elts) == retval_len:
                        # map expressions to values
                        names = [unparse(x) for x in tuple_ast.elts]
                        return {name: value for name, value in zip(names, retval)}

            # can't find any corresponding value
            # this can happen with unpacking assignment with stars
            # (stack_data will refuse to parse the expression)
            return None

    else:
        # resolve by identity

        def resolve_variables() -> Optional[Dict]:
            for expr, _, value in cast(List[stack_data.core.Variable], info.variables):
                if value is retval:
                    return {expr: value}
            return None

    return resolve_variables()


current_profiler = contextvars.ContextVar[Profiler]("current_profiler")
