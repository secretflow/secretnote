from collections import defaultdict
from dataclasses import dataclass
from itertools import chain
from typing import (
    Dict,
    Generic,
    Iterable,
    List,
    Literal,
    Optional,
    Set,
    Tuple,
    Type,
    TypeVar,
    Union,
)

import networkx as nx
from more_itertools import first
from pydantic import BaseModel, Field
from typing_extensions import Annotated

from secretnote.formal.symbols import (
    ExecExpression,
    ExpressionType,
    LocalObject,
    MoveExpression,
    ObjectSymbolType,
    RemoteObject,
    RevealExpression,
    SymbolType,
)
from secretnote.instrumentation.models import LogicalLocation

from .base import Parser

E = TypeVar("E", bound=ExpressionType)
M = TypeVar("M", bound=BaseModel)
T = TypeVar("T")
V = TypeVar("V", bound="GraphNode")


class GraphNode(BaseModel):
    id: str
    epoch: int
    order: int = 0


class GraphEdge(BaseModel):
    source: str
    target: str


class LocalObjectNode(GraphNode):
    kind: Literal["local"] = "local"
    data: LocalObject


class RemoteObjectNode(GraphNode):
    kind: Literal["remote"] = "remote"
    data: RemoteObject


class FunctionNode(GraphNode):
    kind: Literal["function"] = "function"
    data: Optional[LocalObject]
    location: LogicalLocation


class ArgumentEdge(GraphEdge):
    kind: Literal["argument"] = "argument"
    name: Optional[str] = None


class ReturnEdge(GraphEdge):
    kind: Literal["return"] = "return"
    assignment: Optional[str] = None


class TransformEdge(GraphEdge):
    kind: Literal["transform"] = "transform"


class ReferenceEdge(GraphEdge):
    kind: Literal["reference"] = "reference"


class RevealEdge(GraphEdge):
    kind: Literal["reveal"] = "reveal"
    name: Optional[str] = None


ObjectNodeType = Union[LocalObjectNode, RemoteObjectNode]
ObjectNode = TypeVar("ObjectNode", bound=ObjectNodeType)

GraphNodeType = Annotated[
    Union[ObjectNodeType, FunctionNode],
    Field(discriminator="kind"),
]
GraphEdgeType = Annotated[
    Union[ArgumentEdge, ReturnEdge, TransformEdge, ReferenceEdge, RevealEdge],
    Field(discriminator="kind"),
]

T = Tuple[str, int]


class Graph(BaseModel):
    nodes: List[GraphNodeType] = []
    edges: List[GraphEdgeType] = []


@dataclass
class GraphState(Generic[E]):
    state: nx.DiGraph
    epoch: int
    next_expr: E
    counter: int = 0

    def next_node_id(self, sym: SymbolType) -> str:
        self.counter += 1
        return f"{sym.as_key()}@{self.epoch}:{self.counter}"

    def local_node(self, obj: LocalObject):
        return LocalObjectNode(
            id=self.next_node_id(obj),
            data=obj,
            epoch=self.epoch,
            order=self.counter,
        )

    def remote_node(self, obj: RemoteObject):
        return RemoteObjectNode(
            id=self.next_node_id(obj),
            data=obj,
            epoch=self.epoch,
            order=self.counter,
        )

    def all_nodes_of_type(self, type_: Type[M]) -> Iterable[M]:
        for data in self.state.nodes.values():
            try:
                yield type_.parse_obj(data)
            except ValueError:
                continue

    def most_recent_reference(self, reference: ObjectNode) -> ObjectNode:
        filtered = filter(
            lambda t: t.data.ref == reference.data.ref,
            self.all_nodes_of_type(type(reference)),
        )
        most_recent_first = sorted(filtered, key=lambda t: t.epoch, reverse=True)
        return first(most_recent_first, default=reference)


class GraphParser(Parser[GraphState, Type[ExpressionType], Graph]):
    def rule_name(self, expr_type: Type[ExpressionType]) -> str:
        return expr_type.__name__

    def data_name(self, data: GraphState) -> str:
        return type(data.next_expr).__name__


parser = GraphParser()


@parser.parse(ExecExpression)
def parse_exec(self: GraphState[ExecExpression]):
    epoch = self.epoch
    expr = self.next_expr

    delta = Graph()

    remote_objects: Dict[str, Set[str]] = defaultdict(set)

    location = FunctionNode(
        id=self.next_node_id(expr.location),
        epoch=epoch,
        order=0,
        data=expr.function,
        location=expr.location,
    )
    delta.nodes.append(location)

    def add_node(obj: ObjectSymbolType):
        if isinstance(obj, LocalObject):
            node = self.local_node(obj)
        else:
            node = self.remote_node(obj)
            remote_objects[obj.ref].add(node.id)
        delta.nodes.append(node)
        return node

    for obj in chain(expr.boundvars, expr.freevars):
        node = add_node(obj)
        in_edge = ArgumentEdge(source=node.id, target=location.id, name=obj.name)
        delta.nodes.append(node)
        delta.edges.append(in_edge)

    self.counter += 1
    location.order = self.counter

    for obj in expr.results:
        node = add_node(obj)
        out_edge = ReturnEdge(source=location.id, target=node.id, assignment=obj.name)
        delta.edges.append(out_edge)

    for node in self.all_nodes_of_type(RemoteObjectNode):
        if node.data.ref not in remote_objects:
            continue
        next_nodes = remote_objects[node.data.ref]
        if node.id in next_nodes:
            continue
        for next_node_id in next_nodes:
            edge = ReferenceEdge(
                source=node.id,
                target=next_node_id,
                kind="reference",
            )
            delta.edges.append(edge)

    return delta


@parser.parse(MoveExpression)
def parse_move(self: GraphState[MoveExpression]):
    expr = self.next_expr

    delta = Graph()

    if expr.source == expr.target:
        return delta

    target = self.remote_node(expr.target)
    delta.nodes.append(target)

    source = self.remote_node(expr.source)
    last_source = self.most_recent_reference(source)

    if last_source is not source:
        edge = TransformEdge(source=last_source.id, target=target.id)
    else:
        delta.nodes.append(source)
        edge = TransformEdge(source=source.id, target=target.id)

    delta.edges.append(edge)

    return delta


@parser.parse(RevealExpression)
def parse_reveal(self: GraphState[RevealExpression]):
    delta = Graph()
    expr = self.next_expr

    if len(expr.items) == len(expr.results):
        # 1-to-1 correspondence
        # reveal() guarantees ordering

        for source, target in zip(expr.items, expr.results):
            source_node = self.remote_node(source)
            target_node = self.local_node(target)

            last_source = self.most_recent_reference(source_node)

            if last_source is not source_node:
                edge = RevealEdge(
                    source=last_source.id,
                    target=target_node.id,
                    name=target_node.data.name,
                )
            else:
                delta.nodes.append(source_node)
                edge = RevealEdge(
                    source=source_node.id,
                    target=target_node.id,
                    name=target_node.data.name,
                )

            delta.nodes.append(target_node)
            delta.edges.append(edge)

    else:
        # treat this like a function call
        exec_expr = ExecExpression(
            function=None,
            location=LogicalLocation(type="Driver", parties=()),
        )
        exec_expr.boundvars.extend(expr.items)
        exec_expr.results.extend(expr.results)
        state = GraphState(
            state=self.state,
            epoch=self.epoch,
            next_expr=exec_expr,
        )
        delta = parse_exec(state)
        edges = [*delta.edges]
        delta.edges = []
        for edge in edges:
            if isinstance(edge, ArgumentEdge):
                delta.edges.append(RevealEdge(source=edge.source, target=edge.target))
            elif isinstance(edge, ReturnEdge):
                delta.edges.append(
                    RevealEdge(
                        source=edge.source,
                        target=edge.target,
                        name=edge.assignment,
                    )
                )

    return delta
