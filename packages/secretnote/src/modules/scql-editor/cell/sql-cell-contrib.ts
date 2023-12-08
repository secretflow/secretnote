import type { CellMeta, CellModel, CellOptions } from '@difizen/libro-jupyter';
import { CellModelContribution, CellViewContribution } from '@difizen/libro-jupyter';
import { inject, singleton } from '@difizen/mana-app';

import { SqlCellModelFactory } from './sql-cell-protocol';
import { SqlCellView } from './sql-cell-view';

@singleton({ contrib: [CellModelContribution, CellViewContribution] })
export class SqlCellContribution
  implements CellModelContribution, CellViewContribution
{
  protected readonly modelFactory: SqlCellModelFactory;

  constructor(@inject(SqlCellModelFactory) modelFactory: SqlCellModelFactory) {
    this.modelFactory = modelFactory;
  }
  cellMeta: CellMeta = {
    type: 'code',
    name: 'SQL',
    nbformatType: 'code',
    order: 'a',
  };

  canHandle(options: CellOptions, libroType?: string): number {
    if (libroType === this.cellMeta.type) {
      return 3000;
    }
    return -1;
  }

  async createModel(options: CellOptions): Promise<CellModel> {
    const model = this.modelFactory(options);
    return model;
  }

  view = SqlCellView;
}
