import { KernelCommands } from '@difizen/libro-jupyter';
import type { ToolbarRegistry } from '@difizen/mana-app';
import { singleton, ToolbarContribution } from '@difizen/mana-app';

@singleton({ contrib: ToolbarContribution })
export class SecretNoteToolbarContribution implements ToolbarContribution {
  registerToolbarItems(registry: ToolbarRegistry): void {
    registry.unregisterItem(KernelCommands.ShowKernelStatusAndSelector.id);
  }
}
