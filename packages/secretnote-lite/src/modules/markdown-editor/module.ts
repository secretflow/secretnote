// Module for markdown cell.

import { CellOptions } from '@difizen/libro-jupyter';
import { ManaModule } from '@difizen/mana-app';

import { MarkdownCellContribution } from './cell-contrib';
import { MarkdownCellModel } from './model';
import { MarkdownCellModelFactory } from './protocol';
import { MarkdownCellView } from './view';

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
