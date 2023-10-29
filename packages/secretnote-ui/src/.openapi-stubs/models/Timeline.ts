/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DeviceSnapshot } from './DeviceSnapshot';
import type { FrameSnapshot } from './FrameSnapshot';
import type { FunctionSnapshot } from './FunctionSnapshot';
import type { LogicalLocation } from './LogicalLocation';
import type { MappingSnapshot } from './MappingSnapshot';
import type { ObjectSnapshot } from './ObjectSnapshot';
import type { RemoteObjectSnapshot } from './RemoteObjectSnapshot';
import type { SequenceSnapshot } from './SequenceSnapshot';
import type { SnapshotRef } from './SnapshotRef';
import type { TimelineSpan } from './TimelineSpan';
import type { UnboundSnapshot } from './UnboundSnapshot';

export type Timeline = {
  locations?: Array<LogicalLocation>;
  variables?: Record<string, Record<string, (SnapshotRef | UnboundSnapshot | RemoteObjectSnapshot | DeviceSnapshot | FunctionSnapshot | MappingSnapshot | SequenceSnapshot | ObjectSnapshot | FrameSnapshot)>>;
  object_refs?: Record<string, number>;
  timeline?: Array<TimelineSpan>;
};

