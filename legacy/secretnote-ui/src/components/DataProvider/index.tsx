import type { ContextType } from 'react';
import { useMemo } from 'react';

import type { Timeline } from '../../.openapi-stubs';
import { reify } from '../../utils/reify';

import { DataProviderContext } from './context';

export const DataProvider = ({
  timeline,
  children,
}: React.PropsWithChildren<{ timeline?: Timeline }>) => {
  const value: ContextType<typeof DataProviderContext> = useMemo(
    () => ({
      reify: (kind, ref) => reify(kind, ref, timeline?.variables),
    }),
    [timeline?.variables],
  );
  return (
    <DataProviderContext.Provider value={value}>
      {children}
    </DataProviderContext.Provider>
  );
};
