import { Alert } from 'antd';

import type { Visualization as VisualizationProps } from '../.openapi-stubs';

import { DataProvider } from './DataProvider';
import { ExecutionGraph } from './ExecutionGraph';

export function Visualization({ timeline }: VisualizationProps) {
  return (
    <Alert.ErrorBoundary message={<strong>Exception in cell output:</strong>}>
      <DataProvider timeline={timeline}>
        <ExecutionGraph {...timeline.graph} />
      </DataProvider>
    </Alert.ErrorBoundary>
  );
}
