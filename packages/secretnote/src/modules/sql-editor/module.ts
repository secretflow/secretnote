import { LibroDataphinRequestAPI, LibroE2Module } from '@difizen/libro-e2-sql-cell';
import { CellOptions } from '@difizen/libro-jupyter';
import { ManaModule } from '@difizen/mana-app';

import {
  SqlCellContribution,
  SqlCellModel,
  SqlCellModelFactory,
  SqlCellView,
} from './cell';
import { SqlOutputArea } from './output';

export const SQLEditorModule = ManaModule.create()
  .register(
    SqlCellContribution,
    SqlCellView,
    SqlCellModel,
    SqlOutputArea,
    LibroDataphinRequestAPI,
    {
      token: SqlCellModelFactory,
      useFactory: (ctx) => {
        return (options: CellOptions) => {
          const child = ctx.container.createChild();
          child.register({
            token: CellOptions,
            useValue: options,
          });
          const model = child.get(SqlCellModel);
          return model;
        };
      },
    },
  )
  .dependOn(LibroE2Module);
