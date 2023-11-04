import type { Visualization as VisualizationProps } from '../.openapi-stubs';

import { DataProvider } from './DataProvider';
import { ExecutionGraph } from './ExecutionGraph';

export function Visualization({ timeline }: VisualizationProps) {
  return (
    <DataProvider timeline={timeline}>
      <ExecutionGraph {...timeline.graph} />
    </DataProvider>
  );
}
