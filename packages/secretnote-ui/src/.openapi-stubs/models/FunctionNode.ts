/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LocalObject } from './LocalObject';
import type { LogicalLocation } from './LogicalLocation';

export type FunctionNode = {
  id: string;
  epoch: number;
  order?: number;
  kind?: 'function';
  function: LocalObject;
  stackframe?: LocalObject;
  location: LogicalLocation;
};

