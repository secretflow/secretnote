export type ElementOf<T> = T extends (infer E)[] | undefined ? E : never;
