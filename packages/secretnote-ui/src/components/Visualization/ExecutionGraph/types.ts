import type * as G6 from '@antv/g6';

import type { LogicalLocation, DependencyGraph } from '@/.openapi-stubs';
import type { SnapshotReifier } from '@/utils/reify';
import type { ElementOf } from '@/utils/typing';

import type { ColorizeFunction } from './colorization';

export type DependencyGraphNodeType = ElementOf<
  NonNullable<NonNullable<DependencyGraph>['nodes']>
>;

export type DependencyGraphEdgeType = ElementOf<
  NonNullable<NonNullable<DependencyGraph>['edges']>
>;

export type GraphElementType = DependencyGraphNodeType | DependencyGraphEdgeType;

export type GraphUtils = {
  reify: SnapshotReifier;
  colorize: ColorizeFunction<LogicalLocation>;
};

export type TrustedModel<T extends GraphElementType = GraphElementType> =
  G6.ModelConfig & {
    data: T;
    colors?: { foreground: string; background: string };
    _utils: GraphUtils;
  };

export type TrustedNode<T extends DependencyGraphNodeType = DependencyGraphNodeType> =
  G6.NodeConfig & {
    data: T;
    _utils: GraphUtils;
  };

export type TrustedEdge<T extends DependencyGraphEdgeType = DependencyGraphEdgeType> =
  G6.EdgeConfig & {
    id: string;
    source: string;
    target: string;
    data: T;
    _utils: GraphUtils;
  };

export function isTrusted<T extends DependencyGraphNodeType = DependencyGraphNodeType>(
  data: G6.NodeConfig,
): data is TrustedNode<T>;

export function isTrusted<T extends DependencyGraphEdgeType = DependencyGraphEdgeType>(
  data: G6.EdgeConfig,
): data is TrustedEdge<T>;

export function isTrusted<T extends GraphElementType = GraphElementType>(
  data: G6.ModelConfig,
): data is TrustedModel<T>;

export function isTrusted(data: unknown) {
  return (
    typeof data === 'object' &&
    data !== null &&
    'data' in data &&
    typeof data['data'] === 'object' &&
    data['data'] !== null &&
    'kind' in data['data'] &&
    typeof data['data']['kind'] === 'string'
  );
}

export function isOfKind<T extends GraphElementType, K extends T['kind']>(
  kind: K,
  item: G6.ModelConfig,
): item is TrustedModel<Extract<T, { kind?: K }>> {
  if (!isTrusted<T>(item)) {
    return false;
  }
  const data = item.data;
  if (kind !== undefined && data.kind !== kind) {
    return false;
  }
  return true;
}
