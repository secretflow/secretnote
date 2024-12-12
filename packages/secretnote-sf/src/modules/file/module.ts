// The file module. It's about those files on the nodes (servers) that are not notebooks usually.
// E.g., data files (csv, jsonl), log files (log), etc.

import { createViewPreference, ManaModule } from '@difizen/mana-app';

import { ExtraView } from './extra-view';
import { FileService } from './service';
import { FileView, fileViewKey } from './view';
import { FilePreviewService, FilePreviewView, filePreviewViewKey } from './preview';

export const FileModule = ManaModule.create().register(
  FileService,
  FileView,
  FilePreviewService,
  FilePreviewView,
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
  createViewPreference({
    slot: filePreviewViewKey,
    view: FilePreviewView,
    autoCreate: true,
  }),
);
