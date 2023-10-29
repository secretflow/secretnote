/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DeviceSnapshot } from './DeviceSnapshot';
import type { FrameSnapshot } from './FrameSnapshot';
import type { FunctionSnapshot } from './FunctionSnapshot';
import type { MappingSnapshot } from './MappingSnapshot';
import type { ObjectSnapshot } from './ObjectSnapshot';
import type { RemoteObjectSnapshot } from './RemoteObjectSnapshot';
import type { SnapshotRef } from './SnapshotRef';
import type { UnboundSnapshot } from './UnboundSnapshot';

export type SequenceSnapshot = {
  kind?: 'sequence';
  type: string;
  id: string;
  hash?: string;
  snapshot: string;
  values: Array<(SnapshotRef | UnboundSnapshot | RemoteObjectSnapshot | DeviceSnapshot | FunctionSnapshot | MappingSnapshot | SequenceSnapshot | ObjectSnapshot | FrameSnapshot)>;
};

