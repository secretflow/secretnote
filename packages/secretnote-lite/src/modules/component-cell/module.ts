import { CellOptions } from '@difizen/libro-jupyter';
import { ManaModule } from '@difizen/mana-app';

import { ComponentCellContribution } from './cell-contrib';
import { ComponentCellModel } from './model';
import { ComponentCellModelFactory } from './protocol';
import { ComponentCellView } from './view';

export const ComponentCellModule = ManaModule.create().register(
  ComponentCellContribution,
  ComponentCellView,
  ComponentCellModel,
  {
    token: ComponentCellModelFactory,
    useFactory: (ctx) => {
      return (options: CellOptions) => {
        const child = ctx.container.createChild();
        child.register({
          token: CellOptions,
          useValue: options,
        });
        const model = child.get(ComponentCellModel);
        return model;
      };
    },
  },
);
