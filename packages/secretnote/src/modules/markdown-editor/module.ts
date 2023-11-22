import { CellOptions } from '@difizen/libro-jupyter';
import { ManaModule } from '@difizen/mana-app';

import { MarkdownCellContribution } from './markdown-cell-contrib';
import { MarkdownCellModel } from './markdown-cell-model';
import { MarkdownCellModelFactory } from './markdown-cell-protocol';
import { MarkdownCellView } from './markdown-cell-view';

export const MarkdownCellModule = ManaModule.create()
  .register(MarkdownCellContribution, MarkdownCellView, MarkdownCellModel)
  .register({
    token: MarkdownCellModelFactory,
    useFactory: (ctx) => {
      return (options: CellOptions) => {
        const child = ctx.container.createChild();
        child.register({
          token: CellOptions,
          useValue: options,
        });
        const model = child.get(MarkdownCellModel);
        return model;
      };
    },
  });
