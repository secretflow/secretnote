/**
 * Add the index as id to each item in the array.
 */
export function withId<T>(arr: T[]) {
  return arr.map((item, id) => ({ ...item, id }));
}
