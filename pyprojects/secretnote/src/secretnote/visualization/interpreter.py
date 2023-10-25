from collections import defaultdict
from datetime import datetime
from itertools import chain
from typing import (
    Any,
    Dict,
    Generator,
    Iterable,
    List,
    Literal,
    Mapping,
    Optional,
    Sequence,
    Set,
    Tuple,
    Union,
    cast,
)

from opentelemetry.sdk.trace import ReadableSpan
from pydantic import BaseModel, Field
from typing_extensions import Annotated

from secretnote.instrumentation import SpanReader
from secretnote.instrumentation.envvars import OTEL_PYTHON_SECRETNOTE_TRACING_CALL
from secretnote.instrumentation.snapshot import (
    Invocation,
    ObjectLocation,
    RemoteObjectSnapshot,
    SnapshotType,
)


class DriverValue(BaseModel):
    kind: Literal["driver"] = "driver"
    path: Tuple[str, ...] = ()
    snapshot: SnapshotType

    def __str__(self) -> str:
        if self.path:
            return f"IO({self.path[-1]})"
        return "IO"


class RemoteValue(BaseModel):
    kind: Literal["remote"] = "remote"
    path: Tuple[str, ...] = ()
    index: int
    snapshot: RemoteObjectSnapshot

    def __str__(self):
        return f"[{self.index}]"


class InvariantExpression(BaseModel):
    expr: Literal["invariant"] = "invariant"
    semantic: str
    inputs: List[Union[DriverValue, RemoteValue]]
    destination: ObjectLocation
    outputs: List[Union[DriverValue, RemoteValue]]

    def __str__(self):
        inputs = " <- ".join(map(str, self.inputs))
        outputs = " ".join(map(str, self.outputs))
        dest_args = ", ".join(map(str, self.destination[1:]))
        if dest_args:
            dest = f"{self.destination[0]}[{dest_args}]"
        else:
            dest = self.destination[0]
        return f"{outputs} = {self.semantic} {dest} <- {inputs}"


class SendRecvExpression(BaseModel):
    expr: Literal["send_recv"] = "send_recv"
    action: Literal["send", "recv"]
    index: int


Expression = Annotated[
    Union[InvariantExpression, SendRecvExpression],
    Field(discriminator="expr"),
]


class InterpretedCall(BaseModel):
    expression: Optional[Expression] = None

    span_id: str
    start_time: str
    end_time: str
    call: Invocation

    inner_calls: List["InterpretedCall"] = []


def iter_values(
    root: Union[SnapshotType, Sequence[SnapshotType], Mapping[Any, SnapshotType]],
    *prefix: str,
) -> Generator[Tuple[Tuple[str, ...], SnapshotType], None, None]:
    if isinstance(root, Sequence):
        for i, v in enumerate(root):
            yield from iter_values(v, *prefix, f".{i}")
        return
    if isinstance(root, Mapping):
        for k, v in root.items():
            yield from iter_values(v, *prefix, f"{k}")
        return
    if root.kind == "remote_location" or root.kind == "remote_object":
        yield prefix, root
        return
    if (
        root.kind == "object"
        and root.type != "builtins.function"
        and root.type != "builtins.module"
    ):
        yield prefix, root
        return
    if root.kind == "sequence":
        yield from iter_values(root.values, *prefix)
        return
    if root.kind == "mapping":
        yield from iter_values(root.values, *prefix)
        return
    if root.kind == "function":
        yield from iter_values(root.boundvars, *prefix, "(bound variables)")
        yield from iter_values(root.freevars, *prefix, "(free variables)")


class ValueTracker:
    def __init__(self) -> None:
        self.counter = 0
        self.values: Dict[str, RemoteValue] = {}

    def track(
        self,
        path: Tuple[str, ...],
        value: SnapshotType,
    ) -> Union[DriverValue, RemoteValue]:
        if value.kind != "remote_object":
            return DriverValue(path=path, snapshot=value)
        key = value.id
        *_, partial_key = key.split("/ray/")
        if tracked := (self.values.get(key) or self.values.get(partial_key)):
            return tracked
        self.counter += 1
        remote_val = RemoteValue(path=path, index=self.counter, snapshot=value)
        self.values[key] = self.values[partial_key] = remote_val
        return remote_val


def interpret_pyu_call(call: Invocation, tracker: ValueTracker) -> Expression:
    inputs: List[Union[DriverValue, RemoteValue]] = []
    outputs: List[Union[DriverValue, RemoteValue]] = []

    self = call.snapshot.freevars["self"]
    assert self.kind == "remote_location"

    fn = call.snapshot.freevars["fn"]

    for path, value in chain(
        iter_values(call.snapshot.boundvars["args"]),
        iter_values(call.snapshot.boundvars["kwargs"]),
        iter_values(fn.freevars, "(free variables)") if fn.kind == "function" else [],
    ):
        inputs.append(tracker.track(path, value))

    for path, value in iter_values(call.snapshot.retval):
        outputs.append(tracker.track(path, value))

    return InvariantExpression(
        inputs=inputs,
        destination=self.location,
        outputs=outputs,
        semantic="evaluate function",
    )


def interpret_spu_call(call: Invocation, tracker: ValueTracker) -> Expression:
    inputs: List[Union[DriverValue, RemoteValue]] = []
    outputs: List[Union[DriverValue, RemoteValue]] = []

    self = call.snapshot.freevars["self"]
    assert self.kind == "remote_location"

    fn = call.snapshot.freevars["func"]

    for path, value in chain(
        iter_values(call.snapshot.boundvars["args"]),
        iter_values(call.snapshot.boundvars["kwargs"]),
        iter_values(fn.freevars, "(free variables)") if fn.kind == "function" else [],
    ):
        inputs.append(tracker.track(path, value))

    for path, value in iter_values(call.snapshot.retval):
        outputs.append(tracker.track(path, value))

    return InvariantExpression(
        inputs=inputs,
        destination=self.location,
        outputs=outputs,
        semantic="evaluate function",
    )


def interpret_pyu_to_spu(call: Invocation, tracker: ValueTracker) -> Expression:
    self = call.snapshot.boundvars["self"]
    assert self.kind == "remote_object"
    inputs = [tracker.track((), self)]

    dest = call.snapshot.boundvars["spu"]
    assert dest.kind == "remote_location"

    result = call.snapshot.retval
    assert result.kind == "remote_object"
    outputs = [tracker.track((), result)]

    return InvariantExpression(
        inputs=inputs,
        destination=dest.location,
        outputs=outputs,
        semantic="move data",
    )


def interpret_spu_to_pyu(call: Invocation, tracker: ValueTracker) -> Expression:
    self = call.snapshot.boundvars["self"]
    assert self.kind == "remote_object"
    inputs = [tracker.track((), self)]

    dest = call.snapshot.boundvars["pyu"]
    assert dest.kind == "remote_location"

    result = call.snapshot.retval
    assert result.kind == "remote_object"
    outputs = [tracker.track((), result)]

    return InvariantExpression(
        inputs=inputs,
        destination=dest.location,
        outputs=outputs,
        semantic="move data",
    )


def interpret_reveal(call: Invocation, tracker: ValueTracker) -> Expression:
    inputs: List[Union[DriverValue, RemoteValue]] = []
    outputs: List[Union[DriverValue, RemoteValue]] = []

    func_or_object = call.snapshot.boundvars["func_or_object"]
    for path, value in iter_values(func_or_object):
        inputs.append(tracker.track(path, value))

    for path, value in iter_values(call.snapshot.retval):
        outputs.append(tracker.track(path, value))

    return InvariantExpression(
        inputs=inputs,
        destination=("IO",),
        outputs=outputs,
        semantic="move data",
    )


def extract_invocation(span: ReadableSpan) -> Optional[Invocation]:
    if not span.attributes:
        return None
    try:
        raw = cast(str, span.attributes[OTEL_PYTHON_SECRETNOTE_TRACING_CALL])
        return Invocation.parse_raw(raw)
    except Exception:
        return None


def interpret(spans: SpanReader) -> List[InterpretedCall]:
    import secretflow

    MOCK: Any = ...

    calls: Dict[str, InterpretedCall] = {}
    call_associations: Dict[str, List[InterpretedCall]] = defaultdict(list)
    top_level_spans: Set[str] = set()
    discarded_spans: Set[str] = set()

    def sorted_calls(items: Iterable[InterpretedCall]):
        return [*sorted(items, key=lambda x: x.start_time)]

    def sorted_spans(items: Iterable[ReadableSpan]):
        return [*sorted(items, key=lambda x: x.start_time or 0)]

    tracker = ValueTracker()

    for span in sorted_spans(spans.get_finished_spans()):
        call = extract_invocation(span)
        if not call or not span.start_time or not span.end_time:
            discarded_spans.add(hex(span.context.span_id))
            continue
        expr: Optional[Expression] = None
        if call.snapshot.match(secretflow.PYU.__call__(MOCK, MOCK)):
            expr = interpret_pyu_call(call, tracker)
        elif call.snapshot.match(secretflow.SPU.__call__(MOCK, MOCK)):
            expr = interpret_spu_call(call, tracker)
        elif call.snapshot.match(secretflow.device.kernels.pyu.pyu_to_spu):
            expr = interpret_pyu_to_spu(call, tracker)
        elif call.snapshot.match(secretflow.device.kernels.spu.spu_to_pyu):
            expr = interpret_spu_to_pyu(call, tracker)
        elif call.snapshot.match(secretflow.reveal):
            expr = interpret_reveal(call, tracker)
        span_id = hex(span.context.span_id)
        result = InterpretedCall(
            expression=expr,
            span_id=span_id,
            start_time=datetime.fromtimestamp(span.start_time / 10**9).isoformat(),
            end_time=datetime.fromtimestamp(span.end_time / 10**9).isoformat(),
            call=call,
        )
        calls[span_id] = result
        if (
            span.parent
            and (parent_id := hex(span.parent.span_id)) not in discarded_spans
        ):
            call_associations[parent_id].append(result)
        else:
            top_level_spans.add(span_id)

    for k, v in call_associations.items():
        try:
            parent = calls[k]
        except KeyError:
            continue
        parent.inner_calls = sorted_calls(v)

    return sorted_calls([calls[k] for k in top_level_spans])
