/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FrameSnapshot } from './FrameSnapshot';

export type TimelineSpan = {
  span_id: string;
  start_time: string;
  end_time: string;
  index: number;
  frame: FrameSnapshot;
  timeline?: Array<TimelineSpan>;
};

