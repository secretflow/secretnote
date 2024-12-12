import { ManaAppPreset, ManaComponents } from '@difizen/mana-app';
import { message } from 'antd';

import { MarkdownCellModule } from '@/modules/markdown-editor';
import { EditorModule } from '@/modules/editor';
import { FileModule } from '@/modules/file';
import { LayoutModule } from '@/modules/layout';
import { NodeModule } from '@/modules/node';
import { NotebookModule } from '@/modules/notebook';
import { StorageModule } from '@/modules/storage';
import { ThemeModule } from '@/modules/theme';
import { ToolbarModule } from '@/modules/toolbar';
import { WelcomeModule } from '@/modules/welcome';
import { MetricsModule } from '@/modules/metrics';
import { SnippetModule } from '@/modules/toolbar/snippet';
import { localStorageService } from '@/modules/storage/local-storage-service';
// import { ComponentCellModule } from '@/modules/component-cell'

import '@/lang';
import './override.less';

export interface ISecretNoteAppProps {
  backendURL?: string; // backend URL before `/secretnote/*`
  tokenKey?: string; // token key in local storage
  selfDeploy?: boolean; // whether to deploy the app by oneself
}

const App = (props: ISecretNoteAppProps): JSX.Element => {
  return (
    <ManaComponents.Application
      key="secretnote-sf"
      asChild={true}
      modules={[
        ManaAppPreset,
        LayoutModule,
        ThemeModule,
        StorageModule,
        EditorModule,
        MetricsModule,
        NodeModule,
        NotebookModule,
        FileModule,
        MarkdownCellModule,
        ToolbarModule,
        WelcomeModule,
        SnippetModule,
        // TODO this module requires some updates
        // ComponentCellModule,
      ]}
      onReady={() => {
        // do some initialization
        message.config({
          maxCount: 1,
        });
        localStorageService.setData('globalConfig', props);
      }}
    />
  );
};

export default App;
