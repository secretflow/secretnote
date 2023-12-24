import ast
import contextvars
import sys
from contextlib import ExitStack
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

from more_itertools import first_true

from secretnote.utils.logging import log_dev_exception
from secretnote.utils.warnings import optional_dependencies

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
from .utils import Reference, ReferenceMap

with optional_dependencies("instrumentation"):
    import stack_data.core
    from astunparse import unparse
    from opentelemetry import trace
    from opentelemetry.context import Context
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import SimpleSpanProcessor
    from opentelemetry.trace.span import Span


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
        self._recent_stacks: List[Tuple[ExitStack, Span, TracedFrame]] = []
        # most recent on the left
        self._recent_returns: List[FinalizeSpan] = []

    @property
    def checkpoints(self):
        return self._checkpoints

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
            ref, snapshots = _trace_object(obj, self._recorders)
            refs.append(ref)
            values.update(snapshots)
        return refs, values

    def _stack_push(self, frame: FrameType, checkpoint: FunctionCheckpoint):
        stack = ExitStack()

        ctx = self._tracer.start_as_current_span("unknown")
        span = stack.enter_context(ctx)

        # FIXME:

        if (
            checkpoint.function_name
            == "secretflow.device.proxy._actor_wrapper.<locals>.wrapper"
        ):
            frame.f_locals["__actor_method__"] = getattr(
                frame.f_locals["self"].actor_class,
                frame.f_locals["name"],
            )

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

        span.update_name(result.function_name)

        self._recent_stacks.append((stack, span, result))

    def _stack_pop(self, f_current: FrameType, retval: Any):
        if not self._recent_stacks:
            return

        ctx, span, call = self._recent_stacks.pop()

        (retval_ref,), values = self._trace_objects(retval)
        call.retval = retval_ref
        call.variables.update(values)

        def end_current_span(f_back: Optional[FrameType]):
            try:
                if f_back and (named_values := _trace_named_return(f_back, retval)):
                    named_values = {k.strip(): v for k, v in named_values.items()}
                    (refs,), values = self._trace_objects(named_values)
                    call.assignments = refs
                    call.variables.update(values)
            except Exception as e:
                log_dev_exception(e)
            payload = call.json(by_alias=True, exclude_none=True)
            span.set_attribute(OTEL_PYTHON_SECRETNOTE_PROFILER_FRAME, payload)
            ctx.close()

        end_current_span(f_current)

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


def _trace_object(obj: Any, tracers: List[Type[ObjectTracer]]):
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


def _trace_named_return(frame: FrameType, retval: Any):
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
