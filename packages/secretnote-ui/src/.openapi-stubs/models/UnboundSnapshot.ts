/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DeviceSnapshot } from './DeviceSnapshot';
import type { FunctionSnapshot } from './FunctionSnapshot';
import type { MappingSnapshot } from './MappingSnapshot';
import type { ObjectSnapshot } from './ObjectSnapshot';
import type { RemoteObjectSnapshot } from './RemoteObjectSnapshot';
import type { SequenceSnapshot } from './SequenceSnapshot';
import type { SnapshotRef } from './SnapshotRef';

export type UnboundSnapshot = {
  kind?: 'unbound';
  annotation?: string;
  default?: (SnapshotRef | RemoteObjectSnapshot | DeviceSnapshot | FunctionSnapshot | MappingSnapshot | SequenceSnapshot | ObjectSnapshot | UnboundSnapshot);
};

