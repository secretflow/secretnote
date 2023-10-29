/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DeviceSnapshot } from './DeviceSnapshot';
import type { FunctionSnapshot } from './FunctionSnapshot';
import type { ObjectSnapshot } from './ObjectSnapshot';
import type { RemoteObjectSnapshot } from './RemoteObjectSnapshot';
import type { SequenceSnapshot } from './SequenceSnapshot';
import type { SnapshotRef } from './SnapshotRef';
import type { UnboundSnapshot } from './UnboundSnapshot';

export type MappingSnapshot = {
  kind?: 'mapping';
  type: string;
  id: string;
  hash?: string;
  snapshot: string;
  values: Record<string, (SnapshotRef | RemoteObjectSnapshot | DeviceSnapshot | FunctionSnapshot | MappingSnapshot | SequenceSnapshot | ObjectSnapshot | UnboundSnapshot)>;
};

