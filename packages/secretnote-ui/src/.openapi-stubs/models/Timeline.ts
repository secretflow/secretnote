/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DictSnapshot } from './DictSnapshot';
import type { Frame } from './Frame';
import type { FrameInfoSnapshot } from './FrameInfoSnapshot';
import type { FrameSnapshot } from './FrameSnapshot';
import type { FunctionSnapshot } from './FunctionSnapshot';
import type { Graph } from './Graph';
import type { ListSnapshot } from './ListSnapshot';
import type { NoneSnapshot } from './NoneSnapshot';
import type { ObjectSnapshot } from './ObjectSnapshot';
import type { RemoteLocationSnapshot } from './RemoteLocationSnapshot';
import type { RemoteObjectSnapshot } from './RemoteObjectSnapshot';

export type Timeline = {
  variables?: Record<string, (NoneSnapshot | ObjectSnapshot | ListSnapshot | DictSnapshot | RemoteObjectSnapshot | RemoteLocationSnapshot | FunctionSnapshot | FrameInfoSnapshot | FrameSnapshot)>;
  timeline?: Array<Frame>;
  graph: Graph;
};

