/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Semantics } from './Semantics';
import type { SnapshotRef } from './SnapshotRef';

export type OpaqueTracedFrame = {
  semantics?: Semantics;
  function: SnapshotRef;
  local_vars: Record<string, SnapshotRef>;
  global_vars: Record<string, SnapshotRef>;
  return_value: SnapshotRef;
  traceback: Array<SnapshotRef>;
};

