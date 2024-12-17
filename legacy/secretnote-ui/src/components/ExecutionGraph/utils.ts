import type * as G6 from '@antv/g6';
import { registerNode, registerEdge } from '@antv/g6';
import type * as graphlib from '@antv/graphlib';
import { Graph as PureGraph } from '@antv/graphlib';
import isEqual from 'lodash/isEqual';

import type { Graph, LogicalLocation } from '../../.openapi-stubs';

import type {
  GraphUtils,
  GraphElementType,
  TrustedNode,
  TrustedEdge,
  TrustedModel,
  GraphNodeType,
  GraphEdgeType,
} from './types';
import { isTrusted } from './types';

type RenderingContext<T extends GraphElementType, K> = {
  item: Extract<T, { kind?: K }>;
  config: TrustedModel<Extract<T, { kind?: K }>>;
  renderer: G6.IGroup;
  utils: GraphUtils;
};

type ShapeDefinition<T extends GraphElementType, K> = {
  kind: NonNullable<K>;
  render: (ctx: RenderingContext<T, K>) => G6.IShape;
  options?: Omit<G6.ShapeOptions, 'draw'>;
};

type ShapeOptions = G6.ShapeOptions & { kind: string };

export function defineShape<T extends GraphElementType, K extends T['kind']>({
  kind,
  render,
  options,
}: ShapeDefinition<T, K>): ShapeOptions {
  return {
    kind,
    draw: (config, renderer) => {
      if (!isTrusted<Extract<T, { kind?: K }>>(config)) {
        throw new Error(
          `Unexpected model for shape ${kind}: ${JSON.stringify(config)}`,
        );
      }
      const item = config.data;
      const utils = config._utils;
      const shape = render({ item, renderer, config, utils });
      config.size = [shape.attr('width'), shape.attr('height')];
      return shape;
    },
    ...options,
  };
}

export function registerShapes({
  nodes,
  edges,
}: {
  nodes: ShapeOptions[];
  edges: ShapeOptions[];
}) {
  const shapeIdentifier = (type: string, data: { kind?: string }) =>
    `${type}:${data.kind}`;

  nodes.forEach((node) => registerNode(shapeIdentifier('node', node), node));
  edges.forEach((edge) => registerEdge(shapeIdentifier('edge', edge), edge));

  return function fromGraph(graph: Graph, _utils: GraphUtils): G6.GraphData {
    return {
      nodes:
        graph.nodes?.map(
          (node) =>
            ({
              id: node.id,
              type: shapeIdentifier('node', node),
              data: node,
              _utils,
            }) satisfies TrustedNode,
        ) ?? [],
      edges:
        graph.edges?.map(
          (edge) =>
            ({
              id: `${edge.source}-${edge.target}`,
              source: edge.source,
              target: edge.target,
              type: shapeIdentifier('edge', edge),
              data: edge,
              _utils,
            }) satisfies TrustedEdge,
        ) ?? [],
    };
  };
}

export function toPureGraph(graph: G6.Graph) {
  const { nodes = [], edges = [] } = graph.save() as G6.GraphData;
  return new PureGraph({
    nodes: nodes.filter(isTrusted) as TrustedNode[],
    edges: edges.filter(isTrusted) as TrustedEdge[],
  });
}

export function recursive<
  V extends graphlib.PlainObject,
  E extends graphlib.PlainObject,
>(
  graph: graphlib.Graph<V, E>,
  origin: graphlib.ID,
  filterer: (id: graphlib.ID) => graphlib.Node<V>[],
  stopWhen?: (v: graphlib.Node<V>) => boolean,
): graphlib.Node<V>[] {
  const queue: graphlib.Node<V>[] = [...filterer.bind(graph)(origin)];
  const all: graphlib.Node<V>[] = [...queue];
  const seen = new Set<unknown>(queue.map((n) => n.id));
  while (queue.length > 0) {
    const node = queue.shift();
    if (!node) {
      break;
    }
    if (stopWhen && stopWhen(graph.getNode(node.id))) {
      continue;
    }
    const successors = filterer
      .bind(graph)(node.id)
      .filter((n) => !seen.has(n.id));
    successors.forEach((n) => {
      seen.add(n.id);
      queue.push(n);
      all.push(n);
    });
  }
  return all;
}

export function completePartition(
  graph: graphlib.Graph<GraphNodeType, GraphEdgeType>,
  matched: Set<graphlib.ID>,
) {
  [...matched].forEach((v) =>
    graph.getRelatedEdges(v, 'both').forEach((e) => {
      if (matched.has(e.source) && matched.has(e.target)) {
        matched.add(e.id);
      }
    }),
  );
  const unmatched = new Set([
    ...graph
      .getAllNodes()
      .filter((n) => !matched.has(n.id))
      .map((n) => n.id),
    ...graph
      .getAllEdges()
      .filter((e) => !matched.has(e.id))
      .map((e) => e.id),
  ]);
  return { matched, unmatched };
}

export type PartitionFunction = (
  graph: graphlib.Graph<GraphNodeType, GraphEdgeType>,
  id: graphlib.ID,
) => Set<graphlib.ID>;

export const partitionByEntityType: PartitionFunction = (graph, id) => {
  const matched = new Set(
    (() => {
      switch (graph.getNode(id).data.kind) {
        case 'function':
          return graph.getNeighbors(id);
        case 'reveal':
          return graph.getNeighbors(id);
        case 'remote':
        case 'local':
          return [
            ...recursive(graph, id, graph.getPredecessors),
            ...recursive(graph, id, graph.getSuccessors),
          ];
        default:
          return [];
      }
      // I miss Rust
    })().map((v) => v.id),
  );
  matched.add(id);
  return matched;
};

export const partitionByLocation: PartitionFunction = (graph, id) => {
  const byLocation: (
    location: LogicalLocation,
  ) => (v: graphlib.Node<GraphNodeType>) => boolean = (location) => (node) => {
    switch (node.data.kind) {
      case 'function':
        return isEqual(node.data.location, location);
      case 'remote':
        return isEqual(node.data.data.location, location);
      case 'local':
        return graph.getSuccessors(node.id).some((v) => byLocation(location)(v));
      default:
        return false;
    }
  };
  const matched = new Set(
    (() => {
      const node = graph.getNode(id);
      switch (node.data.kind) {
        case 'function':
          return graph.getAllNodes().filter(byLocation(node.data.location));
        case 'remote':
          return graph.getAllNodes().filter(byLocation(node.data.data.location));
        case 'local':
          return graph.getAllNodes().filter((v) => v.data.kind === 'local');
        default:
          return [];
      }
    })().map((v) => v.id),
  );
  matched.add(id);
  return matched;
};
