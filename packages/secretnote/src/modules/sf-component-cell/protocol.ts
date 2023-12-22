import type { CellOptions } from '@difizen/libro-jupyter';

import type { SFComponentCellModel } from './model';

export type SFComponentCellModelFactory = (
  options: CellOptions,
) => SFComponentCellModel;
export const SFComponentCellModelFactory = Symbol('SFComponentCellModelFactory');
