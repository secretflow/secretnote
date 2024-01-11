/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Schema } from 'leva/src/types';

export type AttrType = 'AT_STRING' | 'AT_BOOL' | 'AT_INT';

export type ValueKey = 's' | 'ss' | 'i64' | 'f' | 'b';

export type IOType =
  | 'sf.table.individual'
  | 'sf.table.vertical_table'
  | 'sf.model.ss_sgd';

export type AtomicValue = Record<ValueKey, any>;

export type AtomicValues = Record<ValueKey, any[]>;

export type Value = Record<string, any>;

export type Atomic = {
  isOptional: boolean;
  defaultValue: AtomicValue;
  allowedValues?: AtomicValues;
  lowerBoundEnabled?: boolean;
  lowerBound?: AtomicValue;
  lowerBoundInclusive?: boolean;
};

export interface Attr {
  name: string;
  desc: string;
  type: AttrType;
  atomic: Atomic;
}

export interface IOAttr {
  name: string;
  desc: string;
  // todo
  // colMinCntInclusive?: string;
  // colMaxCntInclusive?: string;
}

export interface IO {
  name: string;
  desc: string;
  types: IOType[];
  attrs?: IOAttr[];
}

export interface ComponentSpec {
  domain: string;
  name: string;
  desc: string;
  version: string;
  attrs?: Attr[];
  inputs: IO[];
  outputs: IO[];
}

export type SchemaItem = Schema[keyof Schema];
