import { Visualization as VisualizationProps } from '../.openapi-stubs';
import { Graph } from './Graph';
import { RefEnvironment } from '../utils';

export function Visualization({ graph, timeline }: VisualizationProps) {
  return (
    <RefEnvironment {...timeline}>
      <Graph {...graph} />
    </RefEnvironment>
  );
}
