import type { CellMeta, CellModel, CellOptions } from '@difizen/libro-jupyter';
import { CellModelContribution, CellViewContribution } from '@difizen/libro-jupyter';
import { inject, singleton } from '@difizen/mana-app';

import { MarkdownCellModelFactory } from './protocol';
import { MarkdownCellView } from './view';

@singleton({ contrib: [CellModelContribution, CellViewContribution] })
export class MarkdownCellContribution
  implements CellModelContribution, CellViewContribution
{
  protected readonly modelFactory: MarkdownCellModelFactory;

  constructor(
    @inject(MarkdownCellModelFactory) modelFactory: MarkdownCellModelFactory,
  ) {
    this.modelFactory = modelFactory;
  }

  cellMeta: CellMeta = {
    type: 'markdown',
    name: 'Markdown',
    order: 'c',
  };

  canHandle(options: CellOptions): number {
    if (options?.cell?.cell_type === this.cellMeta.type) {
      return 1000;
    }
    return -1;
  }

  createModel(options: CellOptions): CellModel {
    const model = this.modelFactory(options);
    return model;
  }

  view = MarkdownCellView;
}
