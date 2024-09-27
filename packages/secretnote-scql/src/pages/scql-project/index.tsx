// This is the project view page for SCQL.

import '@/lang';
import { ManaAppPreset, ManaComponents } from '@difizen/mana-app';

import { PreviewLayoutModule } from '@/modules/layout';
import { SCQLProjectModule } from '@/modules/scql-project';
import { StorageModule } from '@/modules/storage';
import { ThemeModule } from '@/modules/theme';
import { SCQLBrokerModule } from '@/modules/scql-broker';

const App = (): JSX.Element => {
  return (
    <ManaComponents.Application
      key={'scql-project'}
      asChild={true}
      modules={[
        ManaAppPreset,
        StorageModule,
        ThemeModule,
        PreviewLayoutModule,
        SCQLProjectModule,
        SCQLBrokerModule,
      ]}
    />
  );
};

export default App;
