/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LogicalLocation } from './LogicalLocation';

/**
 * Helper class that provides a standard way to create an ABC using
 * inheritance.
 */
export type RemoteObjectSnapshot = {
  ref: string;
  kind?: 'remote_object';
  type: string;
  location: LogicalLocation;
  refs: Array<string>;
};

