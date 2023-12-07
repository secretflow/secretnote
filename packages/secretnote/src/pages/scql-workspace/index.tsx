import '@/lang';
import { ManaAppPreset, ManaComponents } from '@difizen/mana-app';

import { EditorModule } from '@/modules/editor';
import { LayoutModule } from '@/modules/layout';
import { NotebookModule } from '@/modules/notebook';
import { RequestModule } from '@/modules/request';
import { SCQLMemberModule } from '@/modules/scql-member';
import { StorageModule } from '@/modules/storage';
import { ThemeModule } from '@/modules/theme';

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
        EditorModule,
        SCQLMemberModule,
      ]}
    />
  );
};

export default App;
