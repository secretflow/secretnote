// This is the very first app of SecretNote SF, full-featured version.

import { ManaAppPreset, ManaComponents, once } from '@difizen/mana-app';
import { message } from 'antd';
import { useCallback } from 'react';

import { ConfigModule, SecretNoteConfigLocalStorageKey } from '@/modules/config';
import { EditorModule } from '@/modules/editor';
import { FileModule } from '@/modules/file';
import { LayoutModule } from '@/modules/layout';
import { MarkdownCellModule } from '@/modules/markdown-editor';
import { MetricsModule } from '@/modules/metrics';
import { NodeModule } from '@/modules/node';
import { NotebookModule } from '@/modules/notebook';
import { ThemeModule } from '@/modules/theme';
import { ToolbarModule } from '@/modules/toolbar';
import { SnippetModule } from '@/modules/toolbar/snippet';
import { WelcomeModule } from '@/modules/welcome';
// import { ComponentCellModule } from '@/modules/component-cell'

import '@/lang';
import '../../override.less';

export interface ISecretNoteWorkspaceProps {
  backendURL?: string; // backend URL before `/secretnote/*`
  tokenKey?: string; // token key in local storage
  selfDeploy?: boolean; // whether to deploy the app by oneself
}

const App = (props: ISecretNoteWorkspaceProps): JSX.Element => {
  useCallback(
    once(() =>
      localStorage.setItem(SecretNoteConfigLocalStorageKey, JSON.stringify(props)),
    ),
    [],
  )();

  return (
    <ManaComponents.Application
      key="secretnote-sf-workspace"
      asChild
      modules={[
        ManaAppPreset,
        ConfigModule,
        LayoutModule,
        ThemeModule,
        EditorModule,
        MetricsModule,
        NodeModule,
        NotebookModule,
        FileModule,
        MarkdownCellModule,
        ToolbarModule,
        WelcomeModule,
        SnippetModule,
        // ComponentCellModule, // TODO this module requires some updates
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
