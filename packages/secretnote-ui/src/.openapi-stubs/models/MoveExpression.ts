/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LocalObject } from './LocalObject';
import type { RemoteObject } from './RemoteObject';

export type MoveExpression = {
  kind?: 'move';
  source: (RemoteObject | LocalObject);
  target: RemoteObject;
};

