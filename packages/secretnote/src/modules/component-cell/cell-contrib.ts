import type { CellMeta, CellModel, CellOptions } from '@difizen/libro-jupyter';
import { CellModelContribution, CellViewContribution } from '@difizen/libro-jupyter';
import { inject, singleton } from '@difizen/mana-app';

import { ComponentCellModelFactory } from './protocol';
import { ComponentCellView } from './view';

@singleton({ contrib: [CellModelContribution, CellViewContribution] })
export class ComponentCellContribution
  implements CellModelContribution, CellViewContribution
{
  protected readonly modelFactory: ComponentCellModelFactory;

  constructor(
    @inject(ComponentCellModelFactory) modelFactory: ComponentCellModelFactory,
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

  view = ComponentCellView;
}
