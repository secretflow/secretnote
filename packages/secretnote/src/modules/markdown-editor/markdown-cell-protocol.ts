import type { CellOptions } from '@difizen/libro-jupyter';

import type { MarkdownCellModel } from './markdown-cell-model';

export type MarkdownCellModelFactory = (options: CellOptions) => MarkdownCellModel;
export const MarkdownCellModelFactory = Symbol('MarkdownCellModelFactory');
