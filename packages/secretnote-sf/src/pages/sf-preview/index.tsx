// This is the SecretNote SF which is only used for previewing a Notebook.

import { ManaAppPreset, ManaComponents, once } from '@difizen/mana-app';
import { message } from 'antd';
import { useCallback } from 'react';

import { ConfigModule, SecretNoteConfigLocalStorageKey } from '@/modules/config';
import { EditorModule } from '@/modules/editor';
import { LayoutModule } from '@/modules/layout';
import { MarkdownCellModule } from '@/modules/markdown-editor';
import { NotebookModule } from '@/modules/notebook';
import { ThemeModule } from '@/modules/theme';
import { ToolbarModule } from '@/modules/toolbar';
import { WelcomeModule } from '@/modules/welcome';

import '@/lang';
import '../../override.less';

export interface ISecretNotePreviewProps {
  backendURL?: string; // backend URL before `/secretnote/*`
  readonly?: boolean; // whether the app is running in readonly mode
}

const App = (props: ISecretNotePreviewProps): JSX.Element => {
  useCallback(
    once(() =>
      localStorage.setItem(SecretNoteConfigLocalStorageKey, JSON.stringify(props)),
    ),
    [],
  )();

  return (
    <ManaComponents.Application
      key="secretnote-sf-preview"
      asChild
      modules={[
        ManaAppPreset,
        ConfigModule,
        LayoutModule,
        ThemeModule,
        EditorModule,
        NotebookModule,
        MarkdownCellModule,
        WelcomeModule,
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
