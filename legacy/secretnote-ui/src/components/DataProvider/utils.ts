import { useContext } from 'react';

import { DataProviderContext } from './context';

export function useDataProvider() {
  return useContext(DataProviderContext);
}
