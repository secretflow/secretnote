export const transpose = <T>(arr: T[][]) => {
  return arr[0].map((_, colIndex) => arr.map((row) => row[colIndex]));
};

export function withId<T>(arr: T[]) {
  return arr.map((item, id) => ({ ...item, id }));
}
