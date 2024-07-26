import {
  LibroCodeCellModel,
  LibroCodeCellView,
  LibroJupyterModule,
  LibroModel,
} from '@difizen/libro-jupyter';
import { ManaModule } from '@difizen/mana-app';

import { SecretNoteKernelModule } from '@/modules/kernel';
import { SecretNoteServerModule } from '@/modules/server';

import { SecretNoteCodeCellModel, SecretNoteCodeCellView } from './cell';
import { SecretNoteContentContribution } from './contents';
import { SecretNoteModel } from './model';
import { SecretNoteOutputArea } from './output';
import { JupyterWorkspaceService } from './workspace';

export const EditorModule = ManaModule.create()
  .register(
    SecretNoteContentContribution,
    SecretNoteOutputArea,
    JupyterWorkspaceService,
    { token: LibroModel, useClass: SecretNoteModel },
    { token: LibroCodeCellModel, useClass: SecretNoteCodeCellModel },
    { token: LibroCodeCellView, useClass: SecretNoteCodeCellView },
  )
  .dependOn(LibroJupyterModule, SecretNoteServerModule, SecretNoteKernelModule);
