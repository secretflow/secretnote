import { CellOptions } from '@difizen/libro-jupyter';
import { ManaModule } from '@difizen/mana-app';

import { SFComponentCellContribution } from './cell-contrib';
import { SFComponentCellModel } from './model';
import { SFComponentCellModelFactory } from './protocol';
import { SFComponentCellView } from './view';

export const SFComponentCellModule = ManaModule.create().register(
  SFComponentCellContribution,
  SFComponentCellView,
  SFComponentCellModel,
  {
    token: SFComponentCellModelFactory,
    useFactory: (ctx) => {
      return (options: CellOptions) => {
        const child = ctx.container.createChild();
        child.register({
          token: CellOptions,
          useValue: options,
        });
        const model = child.get(SFComponentCellModel);
        return model;
      };
    },
  },
);
