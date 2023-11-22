import { LibroJupyterModule } from '@difizen/libro-jupyter';
import { createViewPreference, ManaModule } from '@difizen/mana-app';

import { PreviewLayoutArea } from '@/modules/layout';
import { SecretNoteServerModule } from '@/modules/server';

import { CsvPreview } from './csv-preview-contrib';
import { ExtraView } from './extra-view';
import { LogPreview } from './log-preview-contrib';
import { FilePreviewView } from './preview-view';
import { FilePreviewContribution } from './protocol';
import { FileService } from './service';
import { FileView, fileViewKey } from './view';

export const FileModule = ManaModule.create().register(
  FileService,
  FileView,
  ExtraView,
  createViewPreference({
    slot: fileViewKey,
    view: FileView,
    autoCreate: true,
  }),
  createViewPreference({
    slot: `${fileViewKey}Extra`,
    view: ExtraView,
    autoCreate: true,
  }),
);

export const FilePreviewModule = ManaModule.create()
  .contribution(FilePreviewContribution)
  .register(
    FileService,
    FilePreviewView,
    CsvPreview,
    LogPreview,
    createViewPreference({
      slot: PreviewLayoutArea.main,
      view: FilePreviewView,
      autoCreate: true,
    }),
  )
  .dependOn(LibroJupyterModule, SecretNoteServerModule);
