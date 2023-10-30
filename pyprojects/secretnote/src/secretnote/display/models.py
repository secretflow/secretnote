from typing import Dict, List, Literal

from pydantic import BaseModel

from secretnote.instrumentation.models import (
    LogicalLocation,
    OpaqueTracedFrame,
    SnapshotType,
)
from secretnote.utils.pydantic import ORJSONConfig


class TimelineSpan(BaseModel):
    span_id: str
    start_time: str
    end_time: str
    rank: int
    frame: OpaqueTracedFrame
    timeline: List["TimelineSpan"] = []


class Timeline(BaseModel):
    locations: List[LogicalLocation] = []
    variables: Dict[str, Dict[int, SnapshotType]] = {}
    object_refs: Dict[str, int] = {}
    timeline: List[TimelineSpan] = []


class GraphNode(BaseModel):
    id: str
    epoch: int
    kind: Literal["value", "location"]
    ref: str


class GraphEdge(BaseModel):
    source: str
    target: str
    kind: Literal["identity", "transform"]
    label: str


class Graph(BaseModel):
    nodes: List[GraphNode] = []
    edges: List[GraphEdge] = []


class Visualization(BaseModel):
    timeline: Timeline
    graph: Graph

    class Config(ORJSONConfig):
        pass
