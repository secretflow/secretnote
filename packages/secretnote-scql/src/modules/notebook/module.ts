import {
  createSlotPreference,
  createViewPreference,
  ManaModule,
} from '@difizen/mana-app';

import { LayoutArea } from '@/modules/layout';

import { EditorView } from './editor-view';
import { ExtraView } from './extra-view';
import { NotebookFileService } from './service';
import { NotebookFileView, notebookFileViewKey } from './view';

export const NotebookModule = ManaModule.create().register(
  EditorView,
  NotebookFileView,
  ExtraView,
  NotebookFileService,
  createSlotPreference({
    slot: LayoutArea.main,
    view: EditorView,
  }),
  createViewPreference({
    slot: notebookFileViewKey,
    view: NotebookFileView,
    autoCreate: true,
  }),
  createViewPreference({
    slot: `${notebookFileViewKey}Extra`,
    view: ExtraView,
    autoCreate: true,
  }),
);
