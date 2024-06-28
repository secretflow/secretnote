import '@/lang';
import { ManaAppPreset, ManaComponents } from '@difizen/mana-app';
import React from 'react';

import { LayoutModule } from '@/modules/layout';

const App = (): JSX.Element => {
  return (
    <ManaComponents.Application
      key="secretnote-lite-app"
      asChild={true}
      modules={[ManaAppPreset, LayoutModule]}
    />
  );
};

export default App;
