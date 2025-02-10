// Mana module for notebook preview.
// see `packages/secretnote-sf/src/modules/notebook/module.ts`
// see `packages/secretnote-sf/src/modules/editor/module.ts`

import {
  LibroCodeCellModel,
  LibroCodeCellView,
  LibroJupyterModule,
  LibroModel,
} from '@difizen/libro-jupyter';
import { createSlotPreference, ManaModule } from '@difizen/mana-app';

import { SecretNoteCodeCellModel, SecretNoteCodeCellView } from '@/modules/editor/cell';
import { SecretNoteOutputArea } from '@/modules/editor/output';
import { JupyterWorkspaceService } from '@/modules/editor/workspace';
import { SecretNoteKernelModule } from '@/modules/kernel';
import { LayoutArea } from '@/modules/layout';
import { SecretNoteServerModule } from '@/modules/server';

import { PreviewSecretNoteContentContribution } from './contents-contrib';
import { PreviewEditorView } from './editor-view';
import { PreviewSecretNoteModel } from './model';
import { PreviewNotebookFileService } from './service';

export const PreviewNotebookModule = ManaModule.create().register(
  PreviewEditorView,
  PreviewNotebookFileService,
  createSlotPreference({
    slot: LayoutArea.main,
    view: PreviewEditorView,
  }),
);

export const PreviewEditorModule = ManaModule.create()
  .register(
    PreviewSecretNoteContentContribution,
    SecretNoteOutputArea,
    JupyterWorkspaceService,
    // Local customization
    { token: LibroModel, useClass: PreviewSecretNoteModel },
    { token: LibroCodeCellModel, useClass: SecretNoteCodeCellModel },
    { token: LibroCodeCellView, useClass: SecretNoteCodeCellView },
  )
  .dependOn(LibroJupyterModule, SecretNoteServerModule, SecretNoteKernelModule);
