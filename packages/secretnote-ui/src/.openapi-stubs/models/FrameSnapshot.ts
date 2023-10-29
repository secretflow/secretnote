/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FunctionSnapshot } from './FunctionSnapshot';
import type { Semantics } from './Semantics';
import type { SourceLocation } from './SourceLocation';

export type FrameSnapshot = {
  semantics: Semantics;
  function: FunctionSnapshot;
  traceback: Array<SourceLocation>;
};

