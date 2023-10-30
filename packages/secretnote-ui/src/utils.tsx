import { createRoot } from 'react-dom/client';
import type { FunctionSnapshot, SnapshotRef, Timeline } from './.openapi-stubs';
import { createContext, useContext, useMemo } from 'react';

export function render({
  elem,
  Component,
  props,
}: {
  elem: HTMLElement;
  Component: React.FC;
  props?: Record<string, unknown>;
}) {
  createRoot(elem).render(<Component {...props} />);
}

type SnapshotType = FunctionSnapshot['closure_vars'][string];

interface RefGetter {
  deref(id: Pick<SnapshotRef, 'id'>): SnapshotType | undefined;
  numbering(id: Pick<SnapshotRef, 'id'>): number | undefined;
}

const RefContext = createContext<RefGetter>({
  deref: () => undefined,
  numbering: () => undefined,
});

export function RefEnvironment({
  variables,
  object_refs,
  children,
}: React.PropsWithChildren<Timeline>) {
  return (
    <RefContext.Provider
      value={useMemo(
        () => ({
          deref: ({ id }) => {
            const values = variables?.[id];
            if (!values) {
              return undefined;
            }
            const entries = Object.entries(values);
            for (let i = entries.length - 1; i >= 0; i--) {
              const [, item] = entries[i];
              if (item.kind !== 'ref') {
                return item;
              }
            }
            return undefined;
          },
          numbering: ({ id }) => {
            return object_refs?.[id];
          },
        }),
        [object_refs, variables],
      )}
    >
      {children}
    </RefContext.Provider>
  );
}

export function useGetters() {
  return useContext(RefContext);
}
