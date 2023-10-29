import { Visualization as VisualizationProps } from '../.openapi-stubs';

export function Visualization({ timeline }: VisualizationProps) {
  return (
    <pre>
      <code>{JSON.stringify(timeline, null, 2)}</code>
    </pre>
  );
}
