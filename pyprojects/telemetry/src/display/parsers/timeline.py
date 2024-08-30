from typing import Dict, List, Optional, Union, cast

import networkx as nx
from pydantic import BaseModel

from secretnote.formal.symbols import ExpressionType, LocalObject, RemoteObject
from secretnote.instrumentation.models import (
    APILevel,
    FunctionCheckpoint,
    OTelSpanDict,
    SnapshotType,
    TracedFrame,
)
from secretnote.instrumentation.sdk import get_traced_frame
from secretnote.utils.pydantic import Reference

from .expression import parser as parse_expression
from .graph import Graph, GraphState
from .graph import parser as parse_graph


class Frame(BaseModel):
    span_id: str
    parent_span_id: Optional[str]
    start_time: str
    end_time: str

    epoch: int = 0
    checkpoints: List[FunctionCheckpoint] = []
    function: Optional[Reference] = None
    frame: Optional[Reference] = None
    retval: Optional[Reference] = None
    expression: Optional[ExpressionType] = None

    inner_frames: List["Frame"] = []


class Timeline(BaseModel):
    variables: Dict[str, SnapshotType] = {}
    timeline: List[Frame] = []
    graph: Graph


class TimelineParser:
    def __init__(self):
        self.frames: Dict[str, Frame] = {}
        self.object_refs: Dict[str, RemoteObject] = {}
        self.trace_data: Dict[str, TracedFrame] = {}
        self.variables: Dict[str, SnapshotType] = {}
        self.call_graph = nx.DiGraph()
        self.data_graph = nx.DiGraph()
        self._pending_frames: Dict[str, Frame] = {}

    @property
    def top_level_calls(self):
        return [span_id for span_id, degree in self.call_graph.in_degree if degree == 0]

    def feed(self, raw_frame: OTelSpanDict):
        span_id = raw_frame.context.span_id
        parent_span_id = raw_frame.parent_id
        start_time = raw_frame.start_time
        end_time = raw_frame.end_time
        self._pending_frames[span_id] = Frame(
            span_id=span_id,
            parent_span_id=parent_span_id,
            start_time=start_time.isoformat(),
            end_time=end_time.isoformat(),
        )
        frame_data = get_traced_frame(raw_frame)
        if frame_data is not None:
            self.trace_data[span_id] = frame_data

    def digest(self):
        for frame in sorted(self._pending_frames.values(), key=lambda f: f.end_time):
            del self._pending_frames[frame.span_id]
            self.frames[frame.span_id] = frame
            self.digest_ordered(frame)

    def digest_ordered(self, frame: Frame):
        if frame.parent_span_id:
            self.call_graph.add_edge(frame.parent_span_id, frame.span_id)
        else:
            self.call_graph.add_node(frame.span_id)

        frame_data = self.trace_data.get(frame.span_id)
        if frame_data is None:
            return

        checkpoints = [
            f.checkpoint
            for sid in self.call_stack(frame.span_id)
            if (f := self.trace_data.get(sid)) is not None
        ]

        frame.epoch = len(self.frames)
        frame.checkpoints = checkpoints
        frame.function = frame_data.function
        frame.frame = frame_data.frame
        frame.retval = frame_data.retval

        self.variables.update(frame_data.variables)

        frame.expression = parse_expression(frame_data)

        is_invariant = (
            len(checkpoints) == 1
            and checkpoints[0].semantics.api_level == APILevel.INVARIANT
        )

        if is_invariant and frame.expression:
            for obj in frame.expression.objects():
                self.add_object(obj)

            state = GraphState(
                frame=frame.frame,
                state=self.data_graph,
                epoch=frame.epoch,
                next_expr=frame.expression,
            )
            parse_graph(state)
            for node in state.changes.nodes:
                self.data_graph.add_node(node.id, **node.dict())
            for edge in state.changes.edges:
                self.data_graph.add_edge(edge.source, edge.target, **edge.dict())

    def export(self) -> Timeline:
        timeline: List[Frame] = []
        all_frames: List[Frame] = []

        for span_id, frame in self.frames.items():
            frame = frame.copy()
            frame.inner_frames = []
            all_frames.append(frame)
            if self.call_graph.in_degree(span_id) == 0:
                timeline.append(frame)
            for _source, target in self.call_graph.out_edges(span_id):
                inner_frame = self.frames[target]
                frame.inner_frames.append(inner_frame)

        for frame in all_frames:
            frame.inner_frames = sorted(frame.inner_frames, key=lambda f: f.start_time)

        graph = Graph.parse_obj(
            {
                "nodes": [data for data in self.data_graph.nodes.values()],
                "edges": [data for data in self.data_graph.edges.values()],
            }
        )

        return Timeline(timeline=timeline, graph=graph, variables=self.variables)

    def add_object(self, obj: Union[LocalObject, RemoteObject]):
        if not isinstance(obj, RemoteObject):
            return
        existing = self.object_refs.get(obj.ref)
        if existing:
            obj.numbering = existing.numbering
        else:
            self.object_refs[obj.ref] = obj
            obj.numbering = len(self.object_refs)

    def call_stack(self, span_id: str) -> List[str]:
        for top in self.top_level_calls:
            try:
                return cast(List[str], nx.shortest_path(self.call_graph, top, span_id))
            except nx.NetworkXNoPath:
                continue
        else:
            raise ValueError(f"Cannot find path to {span_id}")
