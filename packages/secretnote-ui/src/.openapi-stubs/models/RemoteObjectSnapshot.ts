/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LogicalLocation } from './LogicalLocation';

export type RemoteObjectSnapshot = {
  kind?: 'remote_object';
  type: string;
  id: string;
  location: LogicalLocation;
  refs: Array<string>;
};

