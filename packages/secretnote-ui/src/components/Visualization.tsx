import { Visualization as VisualizationProps } from '../.openapi-stubs';

export function Visualization({ graph }: VisualizationProps) {
  return (
    <pre>
      <code>{JSON.stringify(graph, null, 2)}</code>
    </pre>
  );
}
