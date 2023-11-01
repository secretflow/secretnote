from typing import Dict, List, Literal, Optional, Union

from pydantic import BaseModel

from secretnote.formal.symbols import ExpressionType, LocalObject, RemoteObject
from secretnote.instrumentation.models import LogicalLocation, Semantics, SnapshotType
from secretnote.utils.pydantic import Reference


class GraphNode(BaseModel):
    id: str


class GraphEdge(BaseModel):
    source: str
    target: str


class LocalObjectNode(GraphNode):
    data: LocalObject


class RemoteObjectNode(GraphNode):
    data: RemoteObject


class LocationNode(GraphNode):
    data: LogicalLocation


class ArgumentEdge(GraphEdge):
    kind: Literal["argument"] = "argument"


class TransformEdge(GraphEdge):
    kind: Literal["transform"] = "transform"


class RevealEdge(GraphEdge):
    kind: Literal["reveal"] = "reveal"


GraphNodeType = Union[LocalObjectNode, RemoteObjectNode, LocationNode]
GraphEdgeType = Union[ArgumentEdge, TransformEdge, RevealEdge]


class Graph(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]


class Frame(BaseModel):
    span_id: str
    parent_span_id: Optional[str]
    start_time: str
    end_time: str

    epoch: int = 0
    semantics: List[Semantics] = []
    function: Optional[Reference] = None
    frame: Optional[Reference] = None
    retval: Optional[Reference] = None
    expression: Optional[ExpressionType] = None

    inner_frames: List["Frame"] = []


class Timeline(BaseModel):
    variables: Dict[str, SnapshotType] = {}
    timeline: List[Frame] = []
    graph: Graph
