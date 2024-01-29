import '@/lang';
import { ManaAppPreset, ManaComponents } from '@difizen/mana-app';

import { ComponentCellModule } from '@/modules/component-cell';
import { EditorModule } from '@/modules/editor';
import { FileModule } from '@/modules/file';
import { LayoutModule } from '@/modules/layout';
import { MarkdownCellModule } from '@/modules/markdown-editor';
import { MetricsModule } from '@/modules/metrics';
import { NodeModule } from '@/modules/node';
import { NotebookModule } from '@/modules/notebook';
import { StorageModule } from '@/modules/storage';
import { ThemeModule } from '@/modules/theme';
import { ToolbarModule } from '@/modules/toolbar';
import { WelcomeModule } from '@/modules/welcome';

const App = (): JSX.Element => {
  return (
    <ManaComponents.Application
      key={'libro-app'}
      asChild={true}
      modules={[
        ManaAppPreset,
        LayoutModule,
        ThemeModule,
        StorageModule,
        EditorModule,
        NotebookModule,
        NodeModule,
        ToolbarModule,
        FileModule,
        MetricsModule,
        MarkdownCellModule,
        WelcomeModule,
        ComponentCellModule,
      ]}
    />
  );
};

export default App;
