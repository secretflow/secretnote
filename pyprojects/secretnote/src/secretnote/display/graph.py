from functools import wraps
from itertools import chain
from typing import Generator, Optional, Protocol, Tuple, Union

from loguru import logger
from networkx import DiGraph

from secretnote.instrumentation.models import (
    FunctionSignature,
    SnapshotType,
    TracedFrame,
)
from secretnote.instrumentation.profiler import Profiler
from secretnote.instrumentation.sdk import iter_frames
from secretnote.instrumentation.snapshot import type_name

from .models import Graph, GraphEdge, GraphNode


class GraphProcessor(Protocol):
    def __call__(self, epoch: int, frame: TracedFrame, graph: DiGraph) -> None:
        ...


def conditional(*, module: str, name: str):
    def wrapper(fn: GraphProcessor):
        @wraps(fn)
        def wrapped(epoch: int, frame: TracedFrame, graph: DiGraph) -> None:
            if frame.function.module == module and frame.function.name == name:
                try:
                    fn(epoch, frame, graph)
                except Exception as e:
                    logger.warning(e)

        return wrapped

    return wrapper


_FlattenedKeyPath = Tuple[Union[str, int], ...]


def iter_values(
    epoch: int,
    value: SnapshotType,
    prefix: _FlattenedKeyPath = (),
) -> Generator[Tuple[_FlattenedKeyPath, str, SnapshotType], None, None]:
    if value.kind == "unbound" or value.kind == "function" or value.kind == "frame":
        return
    if value.kind == "sequence" and (
        value.type == type_name([]) or value.type == type_name(())
    ):
        for idx, item in enumerate(value.values):
            yield from iter_values(epoch, item, (*prefix, idx))
        return
    if value.kind == "mapping" and value.type == type_name({}):
        for key, item in value.values.items():
            yield from iter_values(epoch, item, (*prefix, str(key)))
        return
    if value.kind == "remote_object":
        yield prefix, value.id, value
        return
    yield prefix, f"{value.id}:{epoch}", value


def get_arg_name(path: _FlattenedKeyPath, sig: Optional[FunctionSignature]) -> str:
    if not sig:
        return ".".join(map(str, path))
    try:
        arg_idx = int(path[0])
        arg_name = [*sig.parameters.items()][arg_idx][0]
    except (KeyError, IndexError, TypeError, ValueError):
        return ".".join(map(str, path))
    return ".".join([arg_name, *map(str, path[1:])])


def get_signature(value: Optional[SnapshotType]):
    try:
        assert value and value.kind == "function" and value.signature
        sig = value.signature
    except (KeyError, AssertionError):
        sig = FunctionSignature()
    return sig


def get_location(epoch: int, graph: DiGraph, target: SnapshotType):
    assert target.kind != "unbound"
    location = f"{target.id}:{epoch}"
    node = GraphNode(id=location, kind="location", epoch=epoch, ref=target.id)
    graph.add_node(node.id, **node.dict())
    return location


def get_in_edges(
    epoch: int,
    graph: DiGraph,
    location: str,
    sig: Optional[FunctionSignature],
    *containers: SnapshotType,
):
    for path, n, value in chain.from_iterable(
        (iter_values(epoch, c) for c in containers)
    ):
        if value.kind == "unbound":
            continue

        node = GraphNode(id=n, kind="value", epoch=epoch, ref=value.id)
        edge = GraphEdge(
            source=n,
            target=location,
            kind="transform",
            label=get_arg_name(path, sig),
        )

        graph.add_node(node.id, **node.dict())
        graph.add_edge(edge.source, edge.target, **edge.dict())


def get_out_edges(
    epoch: int,
    graph: DiGraph,
    location: str,
    *containers: SnapshotType,
):
    for path, n, value in chain.from_iterable(
        (iter_values(epoch, c) for c in containers)
    ):
        if value.kind == "unbound":
            continue

        node = GraphNode(id=n, kind="value", epoch=epoch, ref=value.id)
        edge = GraphEdge(
            source=location,
            target=n,
            kind="transform",
            label=get_arg_name(path, None),
        )

        graph.add_node(node.id, **node.dict())
        graph.add_edge(edge.source, edge.target, **edge.dict())


@conditional(
    module="secretflow.device.device.pyu",
    name="PYU.__call__.<locals>.wrapper",
)
def process_pyu_call(epoch: int, frame: TracedFrame, graph: DiGraph):
    signature = get_signature(frame.function.closure_vars.get("fn"))
    location = get_location(epoch, graph, frame.function.closure_vars["self"])
    get_in_edges(
        epoch,
        graph,
        location,
        signature,
        frame.local_vars["args"],
        frame.local_vars["kwargs"],
    )
    get_out_edges(epoch, graph, location, frame.return_value)


@conditional(
    module="secretflow.device.kernels.pyu",
    name="pyu_to_spu",
)
def process_pyu_to_spu(epoch: int, frame: TracedFrame, graph: DiGraph):
    location = get_location(epoch, graph, frame.local_vars["spu"])
    get_in_edges(epoch, graph, location, None, frame.local_vars["self"])
    get_out_edges(epoch, graph, location, frame.return_value)


@conditional(
    module="secretflow.device.device.spu",
    name="SPU.__call__.<locals>.wrapper",
)
def process_spu_call(epoch: int, frame: TracedFrame, graph: DiGraph):
    signature = get_signature(frame.function.closure_vars.get("func"))
    location = get_location(epoch, graph, frame.function.closure_vars["self"])
    get_in_edges(
        epoch,
        graph,
        location,
        signature,
        frame.local_vars["args"],
        frame.local_vars["kwargs"],
    )
    get_out_edges(epoch, graph, location, frame.return_value)


@conditional(
    module="secretflow.device.kernels.spu",
    name="spu_to_pyu",
)
def process_spu_to_pyu(epoch: int, frame: TracedFrame, graph: DiGraph):
    location = get_location(epoch, graph, frame.local_vars["pyu"])
    get_in_edges(epoch, graph, location, None, frame.local_vars["self"])
    get_out_edges(epoch, graph, location, frame.return_value)


@conditional(
    module="secretflow.device.driver",
    name="reveal",
)
def process_reveal(epoch: int, frame: TracedFrame, graph: DiGraph):
    location = get_location(epoch, graph, frame.function)
    get_in_edges(epoch, graph, location, None, frame.local_vars["func_or_object"])
    get_out_edges(epoch, graph, location, frame.return_value)


def parse_graph(profiler: Profiler):
    spans = profiler.exporter.iter_spans()
    graph = DiGraph()

    for epoch, (outer, frame, _span) in enumerate(iter_frames(spans)):
        if frame.semantics.api_level != 20:
            continue
        if any(level == 20 for level in outer):
            continue
        process_pyu_call(epoch, frame, graph)
        process_pyu_to_spu(epoch, frame, graph)
        process_spu_call(epoch, frame, graph)
        process_spu_to_pyu(epoch, frame, graph)
        process_reveal(epoch, frame, graph)

    for node in graph.nodes.values():
        node["ref"] = node["ref"].split(":")[0]

    nodes = [GraphNode.parse_obj(data) for data in graph.nodes.values()]
    edges = [GraphEdge.parse_obj(data) for data in graph.edges.values()]

    return Graph(nodes=nodes, edges=edges)
