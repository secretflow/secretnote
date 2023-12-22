import type { CellMeta, CellModel, CellOptions } from '@difizen/libro-jupyter';
import { CellModelContribution, CellViewContribution } from '@difizen/libro-jupyter';
import { inject, singleton } from '@difizen/mana-app';

import { SFComponentCellModelFactory } from './protocol';
import { SFComponentCellView } from './view';

@singleton({ contrib: [CellModelContribution, CellViewContribution] })
export class SFComponentCellContribution
  implements CellModelContribution, CellViewContribution
{
  protected readonly modelFactory: SFComponentCellModelFactory;

  constructor(
    @inject(SFComponentCellModelFactory) modelFactory: SFComponentCellModelFactory,
  ) {
    this.modelFactory = modelFactory;
  }
  cellMeta: CellMeta = {
    type: 'component',
    name: 'Component',
    order: 'c',
    nbformatType: 'raw',
  };

  canHandle(options: CellOptions, libroType?: string): number {
    if (libroType === this.cellMeta.type) {
      return 1000;
    }
    return -1;
  }

  async createModel(options: CellOptions): Promise<CellModel> {
    const model = this.modelFactory(options);
    return model;
  }

  view = SFComponentCellView;
}
