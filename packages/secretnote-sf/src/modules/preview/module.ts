// Mana module for notebook preview.
// see `packages/secretnote-sf/src/modules/notebook/module.ts`
// see `packages/secretnote-sf/src/modules/editor/module.ts`

import {
  LibroCodeCellModel,
  LibroCodeCellView,
  LibroJupyterModule,
  LibroModel,
} from '@difizen/libro-jupyter';
import { createSlotPreference, ManaModule, RootSlotId } from '@difizen/mana-app';

import { SecretNoteCodeCellModel, SecretNoteCodeCellView } from '@/modules/editor/cell';
import { SecretNoteOutputArea } from '@/modules/editor/output';
import { JupyterWorkspaceService } from '@/modules/editor/workspace';
import { SecretNoteKernelModule } from '@/modules/kernel';
import { HeaderView, LayoutArea } from '@/modules/layout';
import { SecretNoteServerManager } from '@/modules/server';

import { PreviewSecretNoteContentContribution } from './contents-contrib';
import { PreviewEditorView } from './editor-view';
import { PreviewLayoutView } from './layout';
import { PreviewSecretNoteModel } from './model';
import { PreviewSecretNoteServerManager } from './server-manager';
import { PreviewNotebookFileService } from './service';

// Customized Notebook Module for notebook preview without abilities of modifying notebook files
// see `src/modules/notebook/module.ts`
export const PreviewNotebookModule = ManaModule.create().register(
  PreviewEditorView,
  PreviewNotebookFileService,
  createSlotPreference({
    slot: LayoutArea.main,
    view: PreviewEditorView,
  }),
);

// Customized Server Module for notebook preview without abilities of LSP
// see `src/modules/server/module.ts`
export const PreviewSecretNoteServerModule = ManaModule.create().register({
  token: SecretNoteServerManager, // override using token SecretNoteServerManager
  useClass: PreviewSecretNoteServerManager,
});

// Customized Editor Module for notebook preview without abilities of editing notebook file
// see `src/modules/editor/module.ts`
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
  .dependOn(LibroJupyterModule, PreviewSecretNoteServerModule, SecretNoteKernelModule);

// Module for the layout of the preview page (without sidebar).
export const PreviewLayoutModule = ManaModule.create().register(
  HeaderView,
  PreviewLayoutView,
  createSlotPreference({
    slot: RootSlotId,
    view: PreviewLayoutView,
  }),
  createSlotPreference({
    slot: LayoutArea.header,
    view: HeaderView,
  }),
);
