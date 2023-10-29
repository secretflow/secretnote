/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DeviceSnapshot } from './DeviceSnapshot';
import type { FrameSnapshot } from './FrameSnapshot';
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
  filename?: string;
  firstlineno?: number;
  source?: string;
  docstring?: string;
  closure_vars: Record<string, (SnapshotRef | UnboundSnapshot | RemoteObjectSnapshot | DeviceSnapshot | FunctionSnapshot | MappingSnapshot | SequenceSnapshot | ObjectSnapshot | FrameSnapshot)>;
  global_vars: Record<string, (SnapshotRef | UnboundSnapshot | RemoteObjectSnapshot | DeviceSnapshot | FunctionSnapshot | MappingSnapshot | SequenceSnapshot | ObjectSnapshot | FrameSnapshot)>;
};

