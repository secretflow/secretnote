/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ArgumentEdge } from './ArgumentEdge';
import type { FunctionNode } from './FunctionNode';
import type { LocalObjectNode } from './LocalObjectNode';
import type { ReferenceEdge } from './ReferenceEdge';
import type { RemoteObjectNode } from './RemoteObjectNode';
import type { ReturnEdge } from './ReturnEdge';
import type { RevealEdge } from './RevealEdge';
import type { RevealNode } from './RevealNode';
import type { TransformEdge } from './TransformEdge';

export type Graph = {
  nodes?: Array<(LocalObjectNode | RemoteObjectNode | FunctionNode | RevealNode)>;
  edges?: Array<(ArgumentEdge | ReturnEdge | TransformEdge | ReferenceEdge | RevealEdge)>;
};

