/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ExecExpression } from './ExecExpression';
import type { FunctionCheckpoint } from './FunctionCheckpoint';
import type { MoveExpression } from './MoveExpression';
import type { Reference } from './Reference';
import type { RevealExpression } from './RevealExpression';

export type Frame = {
  span_id: string;
  parent_span_id?: string;
  start_time: string;
  end_time: string;
  epoch?: number;
  checkpoints?: Array<FunctionCheckpoint>;
  function?: Reference;
  frame?: Reference;
  retval?: Reference;
  expressions?: Array<(ExecExpression | MoveExpression | RevealExpression)>;
  inner_frames?: Array<Frame>;
};

