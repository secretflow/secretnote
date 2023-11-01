/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LogicalLocation } from './LogicalLocation';

export type RemoteObject = {
  kind?: 'remote_object';
  numbering?: number;
  ref: string;
  name: string;
  location: LogicalLocation;
};

