import { useContext } from 'react';

import { VisualizationContext } from './context';

export function useVisualizationData() {
  return useContext(VisualizationContext);
}
