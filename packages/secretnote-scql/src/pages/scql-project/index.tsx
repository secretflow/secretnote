// This is the project view page for SCQL.

import { ManaAppPreset, ManaComponents } from '@difizen/mana-app';

import '@/lang';
import { PreviewLayoutModule } from '@/modules/layout';
import { SCQLBrokerModule } from '@/modules/scql-broker';
import { SCQLProjectModule } from '@/modules/scql-project';
import { StorageModule } from '@/modules/storage';
import { ThemeModule } from '@/modules/theme';
import '../../override.less';

const App = (): JSX.Element => {
  return (
    <ManaComponents.Application
      key="secretnote-scql-project"
      asChild
      modules={[
        ManaAppPreset,
        StorageModule,
        ThemeModule,
        PreviewLayoutModule,
        SCQLBrokerModule,
        SCQLProjectModule,
      ]}
    />
  );
};

export default App;
