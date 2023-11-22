import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import type { DataNode } from 'antd/es/tree';

export interface Snippet {
  key: string;
  type: string;
  title: string;
  code: string;
  jsonSchema?: RJSFSchema;
  uiSchema?: UiSchema;
}

export type SnippetNode = Snippet & DataNode;
