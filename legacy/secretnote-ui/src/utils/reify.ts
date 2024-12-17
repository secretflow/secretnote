import type { Reference, ReferenceMap, Timeline } from '../.openapi-stubs';

type TaggedUnion<Tag extends string> = { kind?: Tag };

export type UnionMember<T extends TaggedUnion<string>, K extends T['kind']> = Extract<
  T,
  { kind?: K | undefined }
>;

export type ReferenceResolver<T extends TaggedUnion<string>> = {
  get: (key: string | number) => Reified<T, T> | undefined;
  ofKind: <K extends NonNullable<T['kind']>>(
    kind: K,
    key: string | number,
  ) => Reified<UnionMember<T, K>, T> | undefined;
  items: () => Iterable<[string | number, Reified<T, T>]>;
  itemsOfKind: <K extends NonNullable<T['kind']>>(
    kind: K,
  ) => Iterable<[string | number, Reified<UnionMember<T, K>, T>]>;
};

type ReferenceKeys<T> = {
  [K in keyof T]: T[K] extends ReferenceMap | undefined ? NonNullable<K> : never;
}[keyof T];

// infer T_ distributes StaticRecord/DeferredRecord over the union members of T

export type StaticRecord<T> = T extends infer T_ ? Omit<T_, ReferenceKeys<T_>> : never;

export type DeferredRecord<T, U extends TaggedUnion<string>> = T extends infer T_
  ? Record<ReferenceKeys<T_>, ReferenceResolver<U>>
  : never;

export type Reified<T, U extends TaggedUnion<string>> = StaticRecord<T> &
  DeferredRecord<T, U>;

export type SnapshotType = NonNullable<Timeline['variables']>[string];

export type SnapshotDiscriminator = NonNullable<SnapshotType['kind']>;

export type SnapshotReifier = <K extends SnapshotDiscriminator>(
  kind: K | undefined,
  ref: Reference | undefined,
) => Reified<UnionMember<SnapshotType, K>, SnapshotType> | undefined;

// FIXME: improve these types

function isReferenceList(value: unknown): value is Reference[] {
  return Array.isArray(value);
}

function isReferenceMap(value: unknown): value is Record<string, Reference> {
  return typeof value === 'object' && value !== null && !Object.hasOwn(value, 'kind');
}

export function reify<K extends SnapshotDiscriminator>(
  rootKind: K | undefined,
  rootRef: Reference | undefined,
  variables: Record<string, SnapshotType> | undefined,
): Reified<UnionMember<SnapshotType, K>, SnapshotType> | undefined {
  if (rootRef?.ref === undefined) {
    return undefined;
  }

  const root = variables?.[rootRef.ref];

  if (root === undefined) {
    return undefined;
  }

  if (rootKind !== undefined && root.kind !== rootKind) {
    return undefined;
  }

  const staticItems = Object.fromEntries(
    Object.entries(root).filter(
      ([, value]) => !isReferenceList(value) && !isReferenceMap(value),
    ),
  ) as StaticRecord<UnionMember<SnapshotType, K>>;

  const deferredItems = Object.fromEntries(
    Object.entries(root)
      .filter(([, value]) => isReferenceMap(value) || isReferenceList(value))
      .map(([rootKey, _]) => {
        const lookup: ReferenceMap = _;

        let getReference: (k: unknown) => Reference | undefined;

        let iterKeys: () => Generator<
          readonly [string | number, Reference],
          void,
          unknown
        >;

        if (isReferenceList(lookup)) {
          getReference = (k) => lookup[Number(k)];

          iterKeys = function* () {
            for (let i = 0; i < lookup.length; i++) {
              yield [i, lookup[i]] as const;
            }
          };
        } else {
          getReference = (k) => lookup[String(k)];

          iterKeys = function* () {
            for (const [k, v] of Object.entries(lookup)) {
              yield [k, v] as const;
            }
          };
        }

        const resolver: ReferenceResolver<SnapshotType> = {
          get: (item) => {
            const ref = getReference(item);
            if (!ref) {
              return undefined;
            }
            const value = variables?.[ref.ref];
            if (!value?.kind) {
              return undefined;
            }
            return reify(value.kind, ref, variables);
          },
          ofKind: (kind, item) => {
            const ref = getReference(item);
            if (!ref) {
              return undefined;
            }
            const value = variables?.[ref.ref];
            if (value?.kind !== kind) {
              return undefined;
            }
            return reify(kind, ref, variables);
          },
          items: function* () {
            for (const [key, ref] of iterKeys()) {
              const value = variables?.[ref.ref];
              if (!value?.kind) {
                continue;
              }
              const reified = reify(value.kind, ref, variables);
              if (!reified) {
                continue;
              }
              yield [key, reified];
            }
          },
          itemsOfKind: function* (key) {
            for (const [subkey, ref] of iterKeys()) {
              const value = variables?.[ref.ref];
              if (value?.kind !== key) {
                continue;
              }
              const reified = reify(key, ref, variables);
              if (!reified) {
                continue;
              }
              yield [subkey, reified];
            }
          },
        };

        return [rootKey, resolver];
      }),
  ) as DeferredRecord<UnionMember<SnapshotType, K>, SnapshotType>;

  return { ...staticItems, ...deferredItems };
}
