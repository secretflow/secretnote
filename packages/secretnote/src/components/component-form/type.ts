/* eslint-disable @typescript-eslint/no-explicit-any */
export type AttrType = 'AT_STRING' | 'AT_BOOL' | 'AT_INT' | 'AT_FLOAT';

export type ValueKey = 's' | 'ss' | 'i64' | 'f' | 'b';

export type IOType =
  // table
  | 'sf.table.individual'
  | 'sf.table.vertical_table'
  // binning rule
  | 'sf.rule.binning'
  // model
  | 'sf.model.ss_sgd'
  | 'sf.model.ss_glm'
  | 'sf.model.sgb'
  | 'sf.model.ss_xgb'
  // report
  | 'sf.report';

//         String            Delim                                  Part          Remainder
type Split<S extends string, D extends string> = S extends `${infer P}${D}${infer R}`
  ? [P, ...Split<R, D>]
  : [S];

export type IOTypeKind = Split<IOType, '.'>[1];

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
  upperBoundEnabled?: boolean;
  upperBound?: AtomicValue;
  upperBoundInclusive?: boolean;
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

export interface SchemaItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  properties?: object;
  required?: Array<string>;
  oneOf?: Array<any>;
  $oneOfIndex?: number;
  $oneOfDisabled?: boolean;
  $hidden?: boolean;
  $tableColumnHidden?: boolean;
  $tableRender?: string;
  $componentType?: string;
  $oneOfComponentType?: string;
  $order?: number;
  $formItemProps?: Record<string, any>;
  $disabled?: boolean;
}
