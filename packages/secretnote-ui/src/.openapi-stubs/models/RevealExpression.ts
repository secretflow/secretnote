/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LocalObject } from './LocalObject';
import type { RemoteObject } from './RemoteObject';

export type RevealExpression = {
  kind?: 'reveal';
  items: Array<(LocalObject | RemoteObject)>;
  results: Array<LocalObject>;
};

