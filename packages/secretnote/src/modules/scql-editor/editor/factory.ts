import type { CodeEditorFactory, IEditorOptions } from '@difizen/libro-jupyter';

import { SQLEditor } from './editor';

export const SQLEditorFactory: CodeEditorFactory = (options: IEditorOptions) => {
  return new SQLEditor(options);
};
