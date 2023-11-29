import { createContext } from 'react';

import type { VisualizationProps } from '@/.openapi-stubs';
import type { SnapshotReifier } from '@/utils/reify';

export const VisualizationContext = createContext<{
  props: VisualizationProps;
  reify: SnapshotReifier;
}>({
  props: { variables: {}, frames: [], dependencies: { nodes: [], edges: [] } },
  reify: () => undefined,
});
