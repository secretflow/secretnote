/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DeviceSnapshot } from './DeviceSnapshot';
import type { FunctionSignature } from './FunctionSignature';
import type { MappingSnapshot } from './MappingSnapshot';
import type { ObjectSnapshot } from './ObjectSnapshot';
import type { RemoteObjectSnapshot } from './RemoteObjectSnapshot';
import type { SequenceSnapshot } from './SequenceSnapshot';
import type { SnapshotRef } from './SnapshotRef';
import type { UnboundSnapshot } from './UnboundSnapshot';

export type FunctionSnapshot = {
  kind?: 'function';
  type: string;
  id: string;
  hash: string;
  module?: string;
  name: string;
  signature?: FunctionSignature;
  local_vars: Record<string, (SnapshotRef | RemoteObjectSnapshot | DeviceSnapshot | FunctionSnapshot | MappingSnapshot | SequenceSnapshot | ObjectSnapshot | UnboundSnapshot)>;
  closure_vars: Record<string, (SnapshotRef | RemoteObjectSnapshot | DeviceSnapshot | FunctionSnapshot | MappingSnapshot | SequenceSnapshot | ObjectSnapshot | UnboundSnapshot)>;
  global_vars: Record<string, (SnapshotRef | RemoteObjectSnapshot | DeviceSnapshot | FunctionSnapshot | MappingSnapshot | SequenceSnapshot | ObjectSnapshot | UnboundSnapshot)>;
  return_value: (SnapshotRef | RemoteObjectSnapshot | DeviceSnapshot | FunctionSnapshot | MappingSnapshot | SequenceSnapshot | ObjectSnapshot | UnboundSnapshot);
  filename?: string;
  firstlineno?: number;
  source?: string;
  docstring?: string;
};

