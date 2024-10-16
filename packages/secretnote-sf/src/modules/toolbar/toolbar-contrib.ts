import { KernelCommands, NotebookCommands } from '@difizen/libro-jupyter';
import { ModalContribution, ModalItem, ToolbarRegistry } from '@difizen/mana-app';
import { singleton, ToolbarContribution } from '@difizen/mana-app';

import './index.less';
import { SideToolbarRunItem } from './side-toolbar-run-item';
import { TopToolbarRunItem } from './top-toolbar-run-item';
import { KeybindInstruction } from './keybind-instruction';
import { RestartClearOutputModal } from './restart-clear-outputs-modal';

@singleton({ contrib: [ToolbarContribution, ModalContribution] })
export class SecretNoteToolbarContribution
  implements ToolbarContribution, ModalContribution
{
  registerToolbarItems(registry: ToolbarRegistry) {
    // don't allow manually kernel switch
    registry.unregisterItem(KernelCommands.ShowKernelStatusAndSelector.id);
    // those that are not working and not that useful
    registry.unregisterItem(NotebookCommands.SelectLastRunCell.id);
    registry.unregisterItem(NotebookCommands.UndoCellAction.id);
    registry.unregisterItem(NotebookCommands.RedoCellAction.id);
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
    // Replace with our own keybind instructions
    registry.unregisterItem('notebook:keybind-instructions');
    registry.registerItem({
      id: 'notebook:keybind-instructions',
      command: 'notebook:keybind-instructions',
      icon: KeybindInstruction,
    });
  }

  registerModals() {
    return [
      // override the original RestartClearOutput modal which has no i18n supports
      RestartClearOutputModal,
    ];
  }
}
