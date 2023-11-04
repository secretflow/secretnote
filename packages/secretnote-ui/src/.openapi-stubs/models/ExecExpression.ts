/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LocalObject } from './LocalObject';
import type { LogicalLocation } from './LogicalLocation';
import type { RemoteObject } from './RemoteObject';

export type ExecExpression = {
  kind?: 'exec';
  function: LocalObject;
  location: LogicalLocation;
  boundvars?: Array<(LocalObject | RemoteObject)>;
  freevars?: Array<(LocalObject | RemoteObject)>;
  results?: Array<(LocalObject | RemoteObject)>;
};

