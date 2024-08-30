import type { CellOptions } from '@difizen/libro-jupyter';

import type { SQLCellModel } from './model';

export type SQLCellModelFactory = (options: CellOptions) => SQLCellModel;
export const SQLCellModelFactory = Symbol('SQLCellModelFactory');
