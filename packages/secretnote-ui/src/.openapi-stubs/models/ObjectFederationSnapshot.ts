/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ReferenceMap } from './ReferenceMap';

/**
 * Helper class that provides a standard way to create an ABC using
 * inheritance.
 */
export type ObjectFederationSnapshot = {
  ref: string;
  kind?: 'federated_object';
  type: string;
  federation?: ReferenceMap;
};

