import { KernelCommands, NotebookCommands } from '@difizen/libro-jupyter';
import type { ToolbarRegistry } from '@difizen/mana-app';
import { singleton, ToolbarContribution } from '@difizen/mana-app';

import './index.less';
import { SideToolbarRunItem } from './side-toolbar-run-item';

@singleton({ contrib: ToolbarContribution })
export class SecretNoteToolbarContribution implements ToolbarContribution {
  registerToolbarItems(registry: ToolbarRegistry): void {
    // don't allow manually kernel switch
    registry.unregisterItem(KernelCommands.ShowKernelStatusAndSelector.id);
    // replace the RunSelect action with our custom logics
    registry.unregisterItem(NotebookCommands.SideToolbarRunSelect.id);
    registry.registerItem({
      id: NotebookCommands.SideToolbarRunSelect.id,
      command: NotebookCommands.SideToolbarRunSelect.id,
      icon: SideToolbarRunItem,
      showLabelInline: true,
      group: ['sidetoolbar1'],
      order: 'a',
    });
  }
}
