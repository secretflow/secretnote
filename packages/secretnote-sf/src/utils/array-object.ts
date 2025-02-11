import { pick } from 'lodash-es';

/**
 * Add the index as id to each item in the array.
 */
export function withId<T>(arr: T[]) {
  return arr.map((item, id) => ({ ...item, id }));
}

/**
 * Returns Object.entries with keys sorted.
 * If `lookupKey` is provided, the keys will be first translated by it.
 */
export function entriesWithSortedKey<T>(
  obj: Record<string, T>,
  lookupKey?: Record<string, string>,
) {
  const cmp = (a: string, b: string) => a.localeCompare(b);
  let keys: string[];
  if (!lookupKey) {
    keys = Object.keys(obj).sort(cmp);
  } else {
    const inverse: Record<string, string> = {};
    Object.entries(lookupKey).forEach(([k, v]) => (inverse[v] = k));
    keys = Object.keys(lookupKey)
      .map((k) => lookupKey[k])
      .sort(cmp)
      .map((k) => inverse[k]);
  }

  return keys.map((k) => [k, obj[k]] as [string, T]);
}

/**
 * Pick except keys.
 */
export function pickExcept<T extends object, K extends keyof T>(obj: T, keys: K[]) {
  return pick(
    obj,
    Object.keys(obj).filter((k) => !keys.includes(k as K)),
  ) as Omit<T, K>;
}
