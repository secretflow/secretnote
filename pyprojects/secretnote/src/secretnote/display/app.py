from typing import Dict, List, Optional, Union, cast

import networkx as nx

from secretnote.formal.symbols import LocalObject, RemoteObject
from secretnote.instrumentation.models import APILevel, SnapshotType, TracedFrame
from secretnote.instrumentation.profiler import Profiler
from secretnote.instrumentation.sdk import get_traced_frame
from secretnote.utils.warnings import development_preview_warning

from .models import Frame, VisualizationProps
from .parsers import dependencies, expression
from .parsers.dependencies import DependencyGraph, DependencyGraphParser, GraphState
from .parsers.expression import ExpressionParser


def visualize(
    profiler: Profiler,
    *,
    frame_to_expression: Optional[ExpressionParser] = None,
    expression_to_dependencies: Optional[DependencyGraphParser] = None,
):
    development_preview_warning()

    parse_expression = frame_to_expression or expression.create_parser()
    parse_dependencies = expression_to_dependencies or dependencies.create_parser()

    frame_map: Dict[str, Frame] = {}
    object_refs: Dict[str, RemoteObject] = {}
    trace_data: Dict[str, TracedFrame] = {}
    variables: Dict[str, SnapshotType] = {}
    call_graph = nx.DiGraph()
    data_graph = nx.DiGraph()
    pending_frames: Dict[str, Frame] = {}

    def top_level_calls():
        return [span_id for span_id, degree in call_graph.in_degree if degree == 0]

    def call_stack(span_id: str) -> List[str]:
        for top in top_level_calls():
            try:
                return cast(List[str], nx.shortest_path(call_graph, top, span_id))
            except nx.NetworkXNoPath:
                continue
        else:
            raise ValueError(f"Cannot find path to {span_id}")

    def add_object(obj: Union[LocalObject, RemoteObject]):
        if not isinstance(obj, RemoteObject):
            return
        existing = object_refs.get(obj.ref)
        if existing:
            obj.numbering = existing.numbering
        else:
            object_refs[obj.ref] = obj
            obj.numbering = len(object_refs)

    for raw_frame in profiler.exporter.iter_spans():
        span_id = raw_frame.context.span_id
        parent_span_id = raw_frame.parent_id
        start_time = raw_frame.start_time
        end_time = raw_frame.end_time
        pending_frames[span_id] = Frame(
            span_id=span_id,
            parent_span_id=parent_span_id,
            start_time=start_time.isoformat(),
            end_time=end_time.isoformat(),
        )
        frame_data = get_traced_frame(raw_frame)
        if frame_data is not None:
            trace_data[span_id] = frame_data

    for frame in sorted(pending_frames.values(), key=lambda f: f.end_time):
        del pending_frames[frame.span_id]
        frame_map[frame.span_id] = frame

        if frame.parent_span_id:
            call_graph.add_edge(frame.parent_span_id, frame.span_id)
        else:
            call_graph.add_node(frame.span_id)

        frame_data = trace_data.get(frame.span_id)
        if frame_data is None:
            continue

        checkpoints = [
            f.checkpoint
            for sid in call_stack(frame.span_id)
            if (f := trace_data.get(sid)) is not None
        ]

        frame.epoch = len(frame_map)
        frame.checkpoints = checkpoints
        frame.function = frame_data.function
        frame.frame = frame_data.frame
        frame.retval = frame_data.retval

        variables.update(frame_data.variables)

        frame.expressions = [*parse_expression(frame_data)]

        is_invariant = (
            len(checkpoints) == 1
            and checkpoints[0].semantics.api_level == APILevel.INVARIANT
        )

        if is_invariant and frame.expressions:
            for expr in frame.expressions:
                for obj in expr.objects():
                    add_object(obj)
                state = GraphState(
                    frame=frame.frame,
                    state=data_graph,
                    epoch=frame.epoch,
                    next_expr=expr,
                )
                for _ in parse_dependencies(state):
                    pass
                for node in state.changes.nodes:
                    data_graph.add_node(node.id, **node.dict())
                for edge in state.changes.edges:
                    data_graph.add_edge(edge.source, edge.target, **edge.dict())

    top_level_frames: List[Frame] = []
    flattened_frames: List[Frame] = []

    for span_id, frame in frame_map.items():
        frame = frame.copy()
        frame.inner_frames = []
        flattened_frames.append(frame)
        if call_graph.in_degree(span_id) in (0, 1):
            # FIXME:
            # 0: top-level frame
            # 1: top-level frame except there's a parent trace inherited
            top_level_frames.append(frame)
        for _source, target in call_graph.out_edges(span_id):
            inner_frame = frame_map[target]
            frame.inner_frames.append(inner_frame)

    for frame in flattened_frames:
        frame.inner_frames = sorted(frame.inner_frames, key=lambda f: f.start_time)

    dependency_graph = DependencyGraph.parse_obj(
        {
            "nodes": [data for data in data_graph.nodes.values()],
            "edges": [data for data in data_graph.edges.values()],
        }
    )

    return VisualizationProps(
        variables=variables,
        frames=top_level_frames,
        dependencies=dependency_graph,
    )
