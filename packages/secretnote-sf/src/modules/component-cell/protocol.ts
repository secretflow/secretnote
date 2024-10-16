import type { CellOptions } from '@difizen/libro-jupyter';

import type { ComponentCellModel } from './model';

export type ComponentCellModelFactory = (options: CellOptions) => ComponentCellModel;
export const ComponentCellModelFactory = Symbol('ComponentCellModelFactory');
