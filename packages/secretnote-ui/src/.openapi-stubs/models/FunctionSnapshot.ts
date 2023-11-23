/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FunctionSignature } from './FunctionSignature';
import type { ReferenceMap } from './ReferenceMap';

/**
 * Helper class that provides a standard way to create an ABC using
 * inheritance.
 */
export type FunctionSnapshot = {
  ref: string;
  kind?: 'function';
  type: string;
  bytecode_hash?: string;
  module?: string;
  name: string;
  signature?: FunctionSignature;
  filename?: string;
  firstlineno?: number;
  source?: string;
  docstring?: string;
  default_args?: ReferenceMap;
  closure_vars?: ReferenceMap;
  global_vars?: ReferenceMap;
};

