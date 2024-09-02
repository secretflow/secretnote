export const transpose = <T>(arr: T[][]) => {
  return arr[0].map((_, colIndex) => arr.map((row) => row[colIndex]));
};
