import { KernelCommands, NotebookCommands } from '@difizen/libro-jupyter';
import type { ToolbarRegistry } from '@difizen/mana-app';
import { singleton, ToolbarContribution } from '@difizen/mana-app';

@singleton({ contrib: ToolbarContribution })
export class SCQLToolbarContribution implements ToolbarContribution {
  registerToolbarItems(registry: ToolbarRegistry) {
    // unregister those items that are not needed or working in SCQL
    registry.unregisterItem(NotebookCommands.Interrupt.id);
    registry.unregisterItem(NotebookCommands.RestartClearOutput.id);
    registry.unregisterItem(NotebookCommands.SelectLastRunCell.id);
    registry.unregisterItem(KernelCommands.ShowKernelStatusAndSelector.id);
  }
}
