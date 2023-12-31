import '@/lang';
import { ManaAppPreset, ManaComponents } from '@difizen/mana-app';

import { PreviewLayoutModule } from '@/modules/layout';
import { SCQLProjectModule } from '@/modules/scql-project';
import { StorageModule } from '@/modules/storage';
import { ThemeModule } from '@/modules/theme';

const App = (): JSX.Element => {
  return (
    <ManaComponents.Application
      key={'libro-app'}
      asChild={true}
      modules={[
        ManaAppPreset,
        StorageModule,
        ThemeModule,
        PreviewLayoutModule,
        SCQLProjectModule,
      ]}
    />
  );
};

export default App;
