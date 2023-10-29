/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { OpaqueTracedFrame } from './OpaqueTracedFrame';

export type TimelineSpan = {
  span_id: string;
  start_time: string;
  end_time: string;
  rank: number;
  frame: OpaqueTracedFrame;
  timeline?: Array<TimelineSpan>;
};

