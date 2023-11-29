import { Alert } from 'antd';
import { Outlet, Routes, Route } from 'react-router';

import type { VisualizationProps } from '@/.openapi-stubs';

import { ExecutionGraph } from './ExecutionGraph';
import { ExecutionTimeline } from './ExecutionTimeline';
import { VisualizationContextProvider } from './VisualizationContext';

function RootLayout(props: VisualizationProps) {
  return (
    <VisualizationContextProvider {...props}>
      <Alert.ErrorBoundary message={<strong>Exception in cell output:</strong>}>
        <Outlet />
      </Alert.ErrorBoundary>
    </VisualizationContextProvider>
  );
}

export function Dispatch(props: VisualizationProps) {
  return (
    <Routes>
      <Route path="/" element={<RootLayout {...props} />}>
        <Route path="graph" element={<ExecutionGraph />} />
        <Route path="timeline" element={<ExecutionTimeline />} />
      </Route>
    </Routes>
  );
}
