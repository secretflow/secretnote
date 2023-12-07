import '@/lang';
import { ManaAppPreset, ManaComponents } from '@difizen/mana-app';

import { FilePreviewModule } from '@/modules/file';
import { PreviewLayoutModule } from '@/modules/layout';
import { RequestModule } from '@/modules/request';
import { StorageModule } from '@/modules/storage';

const App = (): JSX.Element => {
  return (
    <ManaComponents.Application
      key={'libro-app'}
      asChild={true}
      modules={[
        ManaAppPreset,
        StorageModule,
        RequestModule,
        PreviewLayoutModule,
        FilePreviewModule,
      ]}
    />
  );
};

export default App;
