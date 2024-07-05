import '@/lang';
import { ManaAppPreset, ManaComponents } from '@difizen/mana-app';
import { NodeModule } from '@/modules/node';
import { EditorModule } from '@/modules/editor';
import { LayoutModule } from '@/modules/layout';
import { StorageModule } from '@/modules/storage';
import { ThemeModule } from '@/modules/theme';
import { NotebookModule } from '@/modules/notebook';
import React from 'react';

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
        NodeModule,
        NotebookModule,
      ]}
    />
  );
};

export default App;
