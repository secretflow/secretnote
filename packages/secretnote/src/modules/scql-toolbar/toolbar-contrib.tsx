import { NotebookCommands } from '@difizen/libro-jupyter';
import type { ToolbarRegistry } from '@difizen/mana-app';
import { singleton, ToolbarContribution } from '@difizen/mana-app';

@singleton({ contrib: ToolbarContribution })
export class SCQLToolbarContribution implements ToolbarContribution {
  registerToolbarItems(registry: ToolbarRegistry): void {
    registry.unregisterItem(NotebookCommands.Interrupt.id);
    registry.unregisterItem(NotebookCommands.RestartClearOutput.id);
  }
}
