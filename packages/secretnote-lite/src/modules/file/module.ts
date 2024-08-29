// The file module. It's about those files on the nodes (servers) that are not notebooks usually.
// E.g., data files (csv, jsonl), log files (log), etc.

import { LibroJupyterModule } from '@difizen/libro-jupyter';
import { createViewPreference, ManaModule } from '@difizen/mana-app';

import { PreviewLayoutArea } from '@/modules/layout';
import { SecretNoteServerModule } from '@/modules/server';

import { ExtraView } from './extra-view';
import { FilePreviewView } from './preview-view';
import { CsvPreview } from './preview/csv-preview-contrib';
import { JsonlPreview } from './preview/jsonl-preview-contrib';
import { LogPreview } from './preview/log-preview-contrib';
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
    JsonlPreview,
    createViewPreference({
      slot: PreviewLayoutArea.main,
      view: FilePreviewView,
      autoCreate: true,
    }),
  )
  .dependOn(LibroJupyterModule, SecretNoteServerModule);
