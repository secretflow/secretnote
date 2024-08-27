import '@/lang';
import { ManaAppPreset, ManaComponents } from '@difizen/mana-app';
import { message } from 'antd';

import { EditorModule } from '@/modules/editor';
import { FileModule } from '@/modules/file';
import { LayoutModule } from '@/modules/layout';
import { MarkdownCellModule } from '@/modules/markdown-editor';
import { NodeModule } from '@/modules/node';
import { NotebookModule } from '@/modules/notebook';
import { StorageModule } from '@/modules/storage';
import { ThemeModule } from '@/modules/theme';
import { ToolbarModule } from '@/modules/toolbar';
import { WelcomeModule } from '@/modules/welcome';
import { MetricsModule } from './modules/metrics';
import './override.less';

const App = (): JSX.Element => {
  return (
    <ManaComponents.Application
      key="secretnote-lite-app"
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
      ]}
      onReady={() => {
        // do some initialization
        message.config({
          maxCount: 1,
        });
      }}
    />
  );
};

export default App;
