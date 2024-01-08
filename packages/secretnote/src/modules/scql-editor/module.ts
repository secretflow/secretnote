import { CellOptions, LibroModel, LibroJupyterModule } from '@difizen/libro-jupyter';
import { ManaModule } from '@difizen/mana-app';

import {
  SQLCellContribution,
  SQLCellModel,
  SQLCellModelFactory,
  SQLCellView,
} from './cell';
import { SQLContentContribution } from './contents';
import { SecretNoteModel } from './model';
import { SqlOutputArea, SQLOutputMimeTypeContribution } from './output';
import { SCQLQueryService } from './service';

export const SCQLEditorModule = ManaModule.create()
  .register(
    SQLContentContribution,
    SQLCellContribution,
    SQLCellView,
    SQLCellModel,
    SqlOutputArea,
    SCQLQueryService,
    SQLOutputMimeTypeContribution,
    { token: LibroModel, useClass: SecretNoteModel },
    {
      token: SQLCellModelFactory,
      useFactory: (ctx) => {
        return (options: CellOptions) => {
          const child = ctx.container.createChild();
          child.register({
            token: CellOptions,
            useValue: options,
          });
          const model = child.get(SQLCellModel);
          return model;
        };
      },
    },
  )
  .dependOn(LibroJupyterModule);
