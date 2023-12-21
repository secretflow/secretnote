import { CellOptions, LibroModel, LibroJupyterModule } from '@difizen/libro-jupyter';
import { ManaModule } from '@difizen/mana-app';

import {
  SqlCellContribution,
  SqlCellModel,
  SqlCellModelFactory,
  SqlCellView,
} from './cell';
import { SecretNoteContentContribution } from './contents';
import { SecretNoteModel } from './model';
import { SqlOutputArea, SQLOutputMimeTypeContribution } from './output';
import { SCQLQueryService } from './service';

export const SCQLEditorModule = ManaModule.create()
  .register(
    SecretNoteContentContribution,
    SqlCellContribution,
    SqlCellView,
    SqlCellModel,
    SqlOutputArea,
    SCQLQueryService,
    SQLOutputMimeTypeContribution,
    { token: LibroModel, useClass: SecretNoteModel },
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
  .dependOn(LibroJupyterModule);
