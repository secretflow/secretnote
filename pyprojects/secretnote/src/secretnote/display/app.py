from typing import Dict, Set

from networkx import DiGraph

from secretnote.instrumentation.profiler import Profiler
from secretnote.instrumentation.sdk import get_frame_data
from secretnote.instrumentation.snapshot import SnapshotCompressor

from .core.renderer import render
from .models import Timeline, TimelineSpan, Visualization


def parse_timeline(profiler: Profiler) -> Timeline:
    spans: Dict[str, TimelineSpan] = {}
    discarded_spans: Set[str] = set()

    graph = DiGraph()
    compressor = SnapshotCompressor()

    raw_spans = sorted(profiler.exporter.iter_spans(), key=lambda s: s.start_time)

    for raw_span in raw_spans:
        frame = get_frame_data(raw_span)
        span_id = raw_span.context.span_id

        if not frame:
            discarded_spans.add(span_id)
            continue

        rank, frame = compressor.update(span_id, frame)
        spans[span_id] = TimelineSpan(
            span_id=span_id,
            start_time=raw_span.start_time.isoformat(),
            end_time=raw_span.end_time.isoformat(),
            rank=rank,
            frame=frame,
        )

        if raw_span.parent_id:
            graph.add_edge(raw_span.parent_id, span_id)
        else:
            graph.add_node(span_id)

    for span_id in discarded_spans:
        if span_id not in graph:
            continue
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
        locations=list(compressor.locations),
        variables=compressor.variables,
        object_refs=compressor.object_refs,
        timeline=top_level_spans,
    )


def visualize_run(profiler: Profiler):
    visualization = Visualization(timeline=parse_timeline(profiler))
    render(visualization)
