from typing import Dict, Set

from networkx import DiGraph

from secretnote.instrumentation.models import (
    FunctionSnapshot,
    LogicalLocation,
    MappingSnapshot,
    RemoteObjectSnapshot,
    SequenceSnapshot,
    SnapshotType,
)
from secretnote.instrumentation.profiler import Profiler
from secretnote.instrumentation.sdk import get_frame_snapshot

from .core.renderer import render
from .models import Timeline, TimelineSpan, Visualization


class ObjectRefTracker:
    def __init__(self) -> None:
        self.counter = 0
        self.numbering: Dict[str, int] = {}
        self.locations: Set[LogicalLocation] = set()

    def track(self, value: RemoteObjectSnapshot) -> None:
        if self.numbering.get(value.id):
            return
        self.counter += 1
        self.numbering[value.id] = self.counter
        self.locations.add(value.location)

    def track_all(self, data: SnapshotType) -> None:
        if isinstance(data, RemoteObjectSnapshot):
            self.track(data)
            return
        if isinstance(data, SequenceSnapshot):
            for item in data.values:
                self.track_all(item)
        elif isinstance(data, MappingSnapshot):
            for item in data.values.values():
                self.track_all(item)
        elif isinstance(data, FunctionSnapshot):
            for item in data.local_vars.values():
                self.track_all(item)
            for item in data.closure_vars.values():
                self.track_all(item)
            for item in data.global_vars.values():
                self.track_all(item)
            self.track_all(data.return_value)


def parse_timeline(profiler: Profiler) -> Timeline:
    spans: Dict[str, TimelineSpan] = {}
    graph = DiGraph()
    discarded_spans: Set[str] = set()
    tracker = ObjectRefTracker()

    for raw_span in profiler.exporter.iter_spans():
        frame_snapshot = get_frame_snapshot(raw_span)
        if not frame_snapshot:
            discarded_spans.add(raw_span.context.span_id)
            continue
        tracker.track_all(frame_snapshot.function)
        span_id = raw_span.context.span_id
        start_time = raw_span.start_time.isoformat()
        end_time = raw_span.end_time.isoformat()
        span = TimelineSpan(
            span_id=span_id,
            start_time=start_time,
            end_time=end_time,
            frame=frame_snapshot,
            index=len(spans),
        )
        spans[span_id] = span
        if raw_span.parent_id:
            graph.add_edge(raw_span.parent_id, span_id)
        else:
            graph.add_node(span_id)

    for span_id in discarded_spans:
        for parent_id in graph.predecessors(span_id):
            for child_id in graph.successors(span_id):
                graph.add_edge(parent_id, child_id)
        graph.remove_node(span_id)

    for span_id in graph.nodes:
        spans[span_id].timeline = sorted(
            (spans[v] for v in graph.successors(span_id)),
            key=lambda s: s.start_time,
        )

    top_level_spans = sorted(
        (spans[v] for v, d in graph.in_degree() if d == 0),
        key=lambda s: s.start_time,
    )

    return Timeline(
        timeline=top_level_spans,
        locations=list(tracker.locations),
        object_refs=tracker.numbering,
    )


def visualize_run(profiler: Profiler):
    visualization = Visualization(timeline=parse_timeline(profiler))
    render(visualization)
