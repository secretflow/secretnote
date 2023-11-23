import { createContext } from 'react';

import type { SnapshotReifier } from '../../utils/reify';

export const DataProviderContext = createContext<{ reify: SnapshotReifier }>({
  reify: () => undefined,
});
