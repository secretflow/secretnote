from dataclasses import dataclass, field
from itertools import chain
from typing import (
    Generic,
    Iterable,
    List,
    Literal,
    Optional,
    Tuple,
    Type,
    TypedDict,
    TypeVar,
    Union,
    overload,
)

from more_itertools import first
from pydantic import BaseModel, Field
from typing_extensions import Annotated

from secretnote.utils.warnings import optional_dependencies

from ...formal.symbols import (
    ExecExpression,
    ExpressionType,
    LocalObject,
    MoveExpression,
    ObjectSymbolType,
    RemoteObject,
    RevealExpression,
)
from ...models import LogicalLocation
from ...utils import Reference
from .base import Parser

with optional_dependencies("instrumentation"):
    import networkx as nx

M = TypeVar("M", bound=BaseModel)
T = TypeVar("T")

V = TypeVar("V", bound="DependencyGraphNodeType")
E = TypeVar("E", bound="DependencyGraphEdgeType")

TExpression = TypeVar("TExpression", bound=ExpressionType)
TObjectNode = TypeVar("TObjectNode", bound="ObjectNodeType")


class DependencyNode(BaseModel):
    id: str
    epoch: int
    order: int = 0


class DependencyEdge(BaseModel):
    source: str
    target: str


class LocalObjectNode(DependencyNode):
    kind: Literal["local"] = "local"
    data: LocalObject


class RemoteObjectNode(DependencyNode):
    kind: Literal["remote"] = "remote"
    data: RemoteObject


class FunctionNode(DependencyNode):
    kind: Literal["function"] = "function"
    function: LocalObject
    stackframe: Optional[LocalObject]
    location: LogicalLocation


class RevealNode(DependencyNode):
    kind: Literal["reveal"] = "reveal"


class ArgumentEdge(DependencyEdge):
    kind: Literal["argument"] = "argument"
    name: Optional[str] = None


class ReturnEdge(DependencyEdge):
    kind: Literal["return"] = "return"
    assignment: Optional[str] = None


class TransformEdge(DependencyEdge):
    kind: Literal["transform"] = "transform"
    destination: LogicalLocation


class ReferenceEdge(DependencyEdge):
    kind: Literal["reference"] = "reference"


class RevealEdge(DependencyEdge):
    kind: Literal["reveal"] = "reveal"
    name: Optional[str] = None


ObjectNodeType = Union[LocalObjectNode, RemoteObjectNode]
DependencyGraphNodeType = Annotated[
    Union[ObjectNodeType, FunctionNode, RevealNode],
    Field(discriminator="kind"),
]
DependencyGraphEdgeType = Annotated[
    Union[ArgumentEdge, ReturnEdge, TransformEdge, ReferenceEdge, RevealEdge],
    Field(discriminator="kind"),
]

T = Tuple[str, int]


class DependencyGraph(BaseModel):
    nodes: List[DependencyGraphNodeType]
    edges: List[DependencyGraphEdgeType]


class NodePosition(TypedDict):
    id: str
    epoch: int
    order: int


@dataclass
class GraphState(Generic[TExpression]):
    frame: Reference
    state: nx.DiGraph
    epoch: int
    next_expr: TExpression
    counter: int = 0
    changes: DependencyGraph = field(
        default_factory=lambda: DependencyGraph(nodes=[], edges=[])
    )

    def next_position(self, key: str) -> NodePosition:
        self.counter += 1
        return {
            "id": f"{key}@{self.epoch}:{self.counter}",
            "epoch": self.epoch,
            "order": self.counter,
        }

    def add_node(self, node: V) -> V:
        self.changes.nodes.append(node)
        return node

    def add_edge(self, edge: DependencyGraphEdgeType) -> DependencyGraphEdgeType:
        self.changes.edges.append(edge)
        return edge

    @overload
    def create_object_node(self, obj: LocalObject) -> LocalObjectNode:
        ...

    @overload
    def create_object_node(self, obj: RemoteObject) -> RemoteObjectNode:
        ...

    def create_object_node(self, obj: ObjectSymbolType):
        if isinstance(obj, LocalObject):
            node = LocalObjectNode(data=obj, **self.next_position(obj.as_key()))
        else:
            node = RemoteObjectNode(data=obj, **self.next_position(obj.as_key()))
        return node

    def all_nodes_of_type(self, type_: Type[M]) -> Iterable[M]:
        for data in self.state.nodes.values():
            try:
                yield type_.parse_obj(data)
            except ValueError:
                continue

    def most_recent_reference(self, reference: TObjectNode) -> TObjectNode:
        filtered = filter(
            lambda t: t.data.ref == reference.data.ref,
            self.all_nodes_of_type(type(reference)),
        )
        most_recent_first = sorted(filtered, key=lambda t: t.epoch, reverse=True)
        return first(most_recent_first, default=reference)

    def reference_or_add_object(self, node: TObjectNode) -> TObjectNode:
        last_node = self.most_recent_reference(node)
        if last_node is node:
            # This is the first time we've seen this object
            self.changes.nodes.append(node)
            return node
        else:
            return last_node


class DependencyGraphParser(Parser[GraphState, Type[ExpressionType], None]):
    def rule_name(self, expr_type: Type[ExpressionType]) -> str:
        return expr_type.__name__

    def data_name(self, data: GraphState) -> str:
        return type(data.next_expr).__name__


def create_parser():
    parser = DependencyGraphParser()

    @parser.parse(ExecExpression)
    def parse_exec(self: GraphState[ExecExpression]):
        expr = self.next_expr

        args: List[ObjectNodeType] = []
        arg_names: List[Union[str, None]] = []

        for obj in chain(expr.boundvars, expr.freevars):
            arg_names.append(obj.name)
            if isinstance(obj, LocalObject):
                args.append(self.add_node(self.create_object_node(obj)))
            else:
                args.append(self.reference_or_add_object(self.create_object_node(obj)))

        func = FunctionNode(
            **self.next_position(expr.location.as_key()),
            function=expr.function,
            stackframe=LocalObject(ref=self.frame.ref) if self.frame else None,
            location=expr.location,
        )
        self.changes.nodes.append(func)

        for obj, name in zip(args, arg_names):
            self.add_edge(ArgumentEdge(source=obj.id, target=func.id, name=name))

        for obj in expr.results:
            node = self.add_node(self.create_object_node(obj))
            self.add_edge(
                ReturnEdge(source=func.id, target=node.id, assignment=obj.name)
            )

        yield

    @parser.parse(MoveExpression)
    def parse_move(self: GraphState[MoveExpression]):
        expr = self.next_expr

        if expr.source == expr.target:
            return

        source = self.reference_or_add_object(self.create_object_node(expr.source))
        target = self.add_node(self.create_object_node(expr.target))

        self.add_edge(
            TransformEdge(
                source=source.id,
                target=target.id,
                destination=expr.target.location,
            )
        )

        yield

    @parser.parse(RevealExpression)
    def parse_reveal(self: GraphState[RevealExpression]):
        expr = self.next_expr

        args: List[ObjectNodeType] = []

        for item in expr.items:
            args.append(self.reference_or_add_object(self.create_object_node(item)))

        reveal = self.add_node(RevealNode(**self.next_position("reveal")))

        for node in args:
            self.add_edge(RevealEdge(source=node.id, target=reveal.id))

        for result in expr.results:
            node = self.add_node(self.create_object_node(result))
            self.add_edge(RevealEdge(source=reveal.id, target=node.id))

        yield

    return parser
