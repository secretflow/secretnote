/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ReferenceMap } from './ReferenceMap';

/**
 * Helper class that provides a standard way to create an ABC using
 * inheritance.
 */
export type FrameSnapshot = {
  ref: string;
  kind?: 'frame';
  type: string;
  local_vars?: ReferenceMap;
  global_vars?: ReferenceMap;
  outer_frames?: ReferenceMap;
  module?: string;
  func: string;
};

