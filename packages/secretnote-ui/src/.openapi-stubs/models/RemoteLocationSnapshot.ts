/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LogicalLocation } from './LogicalLocation';

/**
 * Helper class that provides a standard way to create an ABC using
 * inheritance.
 */
export type RemoteLocationSnapshot = {
  ref: string;
  kind?: 'remote_location';
  type: string;
  location: LogicalLocation;
};

