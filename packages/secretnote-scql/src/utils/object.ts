// https://gist.github.com/kuroski/9a7ae8e5e5c9e22985364d1ddbf3389d

/**
 * Convert snake_case to camelCase.
 */
export type ToCamelCase<S extends string> =
  S extends `${infer P1}_${infer P2}${infer R}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${ToCamelCase<R>}`
    : Lowercase<S>;

/**
 * Convert camelCase to snake_case.
 */
export type ToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? '_' : ''}${Lowercase<T>}${ToSnakeCase<U>}`
  : S;

/**
 * Convert snake_case object keys to camelCase.
 */
export type ToCamelCaseObject<T extends Record<string, any>> = {
  [K in keyof T as ToCamelCase<string & K>]: T[K];
};

/**
 * Convert camelCase object keys to snake_case.
 */
export type ToSnakeCaseObject<T extends Record<string, any>> = {
  [K in keyof T as ToSnakeCase<string & K>]: T[K];
};

/**
 * Convert snake_case to camelCase.
 */
export function toCamelCase(str: string) {
  return str.replace(/_([a-z])/g, (_, letter) =>
    letter.toUpperCase(),
  ) as ToCamelCase<string>;
}

/**
 * Convert camelCase to snake_case.
 */
export function toSnakeCase(str: string) {
  return str.replace(
    /([A-Z])/g,
    (_, letter) => `_${letter.toLowerCase()}`,
  ) as ToSnakeCase<string>;
}

/**
 * Convert snake_case object keys to camelCase.
 */
export function toCamelCaseObject<T extends Record<string, any>>(
  obj: T,
): ToCamelCaseObject<T> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [toCamelCase(key), value]),
  ) as ToCamelCaseObject<T>;
}

/**
 * Convert camelCase object keys to snake_case.
 */
export function toSnakeCaseObject<T extends Record<string, any>>(obj: T) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [toSnakeCase(key), value]),
  ) as ToSnakeCaseObject<T>;
}
