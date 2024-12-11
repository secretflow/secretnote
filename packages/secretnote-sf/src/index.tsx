import '@/lang';
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
// import { ComponentCellModule } from '@/modules/component-cell'
import { SnippetModule } from '@/modules/toolbar/snippet';
import { localStorageService } from './modules/storage/local-storage-service';
import './override.less';
import { FilePreviewModule } from './modules/file/preview';

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
        // TODO these two modules requires some updates
        // ComponentCellModule,
        SnippetModule,
        FilePreviewModule,
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
