// This is the SecretNote SF which is only used for previewing a Notebook.

import { ManaAppPreset, ManaComponents } from '@difizen/mana-app';
import { message } from 'antd';

import { ConfigModule, SecretNoteConfigLocalStorageKey } from '@/modules/config';
import { MarkdownCellModule } from '@/modules/markdown-editor';
import {
  PreviewEditorModule,
  PreviewLayoutModule,
  PreviewNotebookModule,
} from '@/modules/preview';
import { ThemeModule } from '@/modules/theme';
import { ToolbarModule } from '@/modules/toolbar';

import '@/lang';
import { useRunOnce } from '@/utils/hook';
import '../../override.less';
import './index.less';

export interface ISecretNotePreviewProps {
  fileURL?: string; // file URL of the notebook to preview
  readonly?: boolean; // whether the app is running in readonly mode
}

const App = (props: ISecretNotePreviewProps): JSX.Element => {
  useRunOnce(() => {
    localStorage.setItem(SecretNoteConfigLocalStorageKey, JSON.stringify(props));
  });

  return (
    <ManaComponents.Application
      key="secretnote-sf-preview"
      asChild
      modules={[
        ManaAppPreset,
        ConfigModule,
        PreviewLayoutModule,
        ThemeModule,
        PreviewNotebookModule,
        PreviewEditorModule,
        MarkdownCellModule,
        ToolbarModule,
      ]}
      onReady={() => {
        // perform some initialization here
        message.config({
          maxCount: 1,
        });
      }}
    />
  );
};

export default App;
