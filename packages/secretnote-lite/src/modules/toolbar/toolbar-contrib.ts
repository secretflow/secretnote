import { KernelCommands, NotebookCommands } from '@difizen/libro-jupyter';
import type { ToolbarRegistry } from '@difizen/mana-app';
import { singleton, ToolbarContribution } from '@difizen/mana-app';

import './index.less';
import { SideToolbarRunItem } from './side-toolbar-run-item';
import { TopToolbarRunItem } from './top-toolbar-run-item';

@singleton({ contrib: ToolbarContribution })
export class SecretNoteToolbarContribution implements ToolbarContribution {
  registerToolbarItems(registry: ToolbarRegistry): void {
    // don't allow manually kernel switch
    registry.unregisterItem(KernelCommands.ShowKernelStatusAndSelector.id);
    // Libro's internal cannot judge kernel status correctly due to customized `SecretNoteModel`
    // making the RunSelect buttons always disabled. So we replace them with our own buttons and logics.
    // (see `libro-jupyter/src/toolbar/run-selector.tsx` and `libro-core/src/toolbar/libro-toolbar.tsx`)
    registry.unregisterItem(NotebookCommands.SideToolbarRunSelect.id);
    registry.registerItem({
      id: NotebookCommands.SideToolbarRunSelect.id,
      command: NotebookCommands.SideToolbarRunSelect.id,
      icon: SideToolbarRunItem,
      showLabelInline: true,
      group: ['sidetoolbar1'],
      order: 'a',
    });
    registry.unregisterItem(NotebookCommands.TopToolbarRunSelect.id);
    registry.registerItem({
      id: NotebookCommands.TopToolbarRunSelect.id,
      command: NotebookCommands.TopToolbarRunSelect.id,
      icon: TopToolbarRunItem,
      group: ['group2'],
      order: 'a',
    });
  }
}
