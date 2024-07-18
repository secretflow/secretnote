import '@/lang';
import { ManaAppPreset, ManaComponents } from '@difizen/mana-app';
import React from 'react';

import { EditorModule } from '@/modules/editor';
import { FileModule } from '@/modules/file';
import { LayoutModule } from '@/modules/layout';
import { MarkdownCellModule } from '@/modules/markdown-editor';
import { NodeModule } from '@/modules/node';
import { NotebookModule } from '@/modules/notebook';
import { StorageModule } from '@/modules/storage';
import { ThemeModule } from '@/modules/theme';
import { ToolbarModule } from '@/modules/toolbar';
import { WelcomeModule } from '@/modules/welcome';
import './override.less';

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
        FileModule,
        MarkdownCellModule,
        ToolbarModule,
        WelcomeModule,
      ]}
    />
  );
};

export default App;
