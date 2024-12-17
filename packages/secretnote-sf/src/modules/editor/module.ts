import {
  LibroCodeCellModel,
  LibroCodeCellView,
  LibroJupyterModule,
  LibroModel,
} from '@difizen/libro-jupyter';
import { ManaModule } from '@difizen/mana-app';

import { SecretNoteModel } from '@/modules/editor';
import { SecretNoteCodeCellModel, SecretNoteCodeCellView } from '@/modules/editor/cell';
import { SecretNoteContentContribution } from '@/modules/editor/contents';
import { SecretNoteOutputArea } from '@/modules/editor/output';
import { JupyterWorkspaceService } from '@/modules/editor/workspace';
import { SecretNoteKernelModule } from '@/modules/kernel';
import { SecretNoteServerModule } from '@/modules/server';

export const EditorModule = ManaModule.create()
  .register(
    SecretNoteContentContribution,
    SecretNoteOutputArea,
    JupyterWorkspaceService,
    // Local customization
    { token: LibroModel, useClass: SecretNoteModel },
    { token: LibroCodeCellModel, useClass: SecretNoteCodeCellModel },
    { token: LibroCodeCellView, useClass: SecretNoteCodeCellView },
  )
  .dependOn(LibroJupyterModule, SecretNoteServerModule, SecretNoteKernelModule);
