import type { CellOptions } from '@difizen/libro-jupyter';

import type { SqlCellModel } from './sql-cell-model';

export type SqlCellModelFactory = (options: CellOptions) => SqlCellModel;
export const SqlCellModelFactory = Symbol('SqlCellModelFactory');
