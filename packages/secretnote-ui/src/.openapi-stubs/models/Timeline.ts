/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LogicalLocation } from './LogicalLocation';
import type { TimelineSpan } from './TimelineSpan';

export type Timeline = {
  timeline?: Array<TimelineSpan>;
  locations?: Array<LogicalLocation>;
  object_refs?: Record<string, number>;
};

