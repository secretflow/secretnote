import '@/lang';
import { ManaAppPreset, ManaComponents } from '@difizen/mana-app';

import { LayoutModule } from '@/modules/layout';
import { MarkdownCellModule } from '@/modules/markdown-editor';
import { NotebookModule } from '@/modules/notebook';
import { RequestModule } from '@/modules/request';
import { SCQLEditorModule } from '@/modules/scql-editor';
import { SCQLMemberModule } from '@/modules/scql-member';
import { SCQLDataTableModule } from '@/modules/scql-table';
import { StorageModule } from '@/modules/storage';
import { ThemeModule } from '@/modules/theme';
import { ToolbarModule } from '@/modules/toolbar';

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
        RequestModule,
        NotebookModule,
        SCQLMemberModule,
        SCQLDataTableModule,
        SCQLEditorModule,
        ToolbarModule,
        MarkdownCellModule,
      ]}
    />
  );
};

export default App;
