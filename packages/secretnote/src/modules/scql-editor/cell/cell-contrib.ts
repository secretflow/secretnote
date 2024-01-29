import type { CellMeta, CellModel, CellOptions } from '@difizen/libro-jupyter';
import { CellModelContribution, CellViewContribution } from '@difizen/libro-jupyter';
import { inject, singleton } from '@difizen/mana-app';

import { SQLCellModelFactory } from './protocol';
import { SQLCellView } from './view';

@singleton({ contrib: [CellModelContribution, CellViewContribution] })
export class SQLCellContribution
  implements CellModelContribution, CellViewContribution
{
  protected readonly modelFactory: SQLCellModelFactory;

  constructor(@inject(SQLCellModelFactory) modelFactory: SQLCellModelFactory) {
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

  view = SQLCellView;
}
