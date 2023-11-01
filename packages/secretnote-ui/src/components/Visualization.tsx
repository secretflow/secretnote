import { Visualization as VisualizationProps } from '../.openapi-stubs';
import { Graph } from './Graph';

export function Visualization({ timeline }: VisualizationProps) {
  return <Graph {...timeline.graph} />;
}
