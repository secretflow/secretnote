import { ManaAppPreset, ManaComponents } from '@difizen/mana-app';

import { LayoutModule } from '@/modules/layout';
import { MarkdownCellModule } from '@/modules/markdown-editor';
import { NotebookModule } from '@/modules/notebook';
import { SCQLBrokerModule } from '@/modules/scql-broker';
import { SCQLEditorModule } from '@/modules/scql-editor';
import { SCQLMemberModule } from '@/modules/scql-member';
import { SCQLProjectModule } from '@/modules/scql-project';
import { SCQLTableModule } from '@/modules/scql-table';
import { SCQLToolbarModule } from '@/modules/scql-toolbar';
import { StorageModule } from '@/modules/storage';
import { ThemeModule } from '@/modules/theme';
import { WelcomeModule } from '@/modules/welcome';

import '@/lang';
import '../../override.less';

const App = (): JSX.Element => {
  return (
    <ManaComponents.Application
      key="secretnote-scql-workspace"
      asChild
      modules={[
        ManaAppPreset,
        LayoutModule,
        ThemeModule,
        StorageModule,
        NotebookModule,
        SCQLBrokerModule,
        SCQLProjectModule,
        SCQLMemberModule,
        SCQLTableModule,
        SCQLEditorModule,
        SCQLToolbarModule,
        MarkdownCellModule,
        WelcomeModule,
      ]}
    />
  );
};

export default App;
