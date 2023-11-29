import type { ContextType } from 'react';
import { useMemo } from 'react';

import type { VisualizationProps } from '@/.openapi-stubs';
import { reify } from '@/utils/reify';

import { VisualizationContext } from './context';

export const VisualizationContextProvider = ({
  variables,
  dependencies,
  frames,
  children,
}: React.PropsWithChildren<VisualizationProps>) => {
  const value: ContextType<typeof VisualizationContext> = useMemo(
    () => ({
      props: { variables, dependencies, frames },
      reify: (kind, ref) => reify(kind, ref, variables),
    }),
    [frames, dependencies, variables],
  );
  return (
    <VisualizationContext.Provider value={value}>
      {children}
    </VisualizationContext.Provider>
  );
};
