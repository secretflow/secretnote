// Customized command to add snippet feature for SecretNote.

import {
  Command,
  CommandContribution,
  CommandRegistry,
  inject,
  singleton,
  ToolbarContribution,
  ToolbarRegistry,
} from '@difizen/mana-app';
import {
  LibroCommandRegister,
  LibroToolbarArea,
  LibroView,
} from '@difizen/libro-jupyter';
import { SnippetView } from './view';

const SnippetCommand: Command = {
  id: 'notebook:snippet',
};
@singleton({ contrib: [CommandContribution, ToolbarContribution] })
export class SnippetContribution implements CommandContribution, ToolbarContribution {
  protected readonly commandRegister: LibroCommandRegister;

  constructor(@inject(LibroCommandRegister) commandRegister: LibroCommandRegister) {
    this.commandRegister = commandRegister;
  }

  registerCommands(command: CommandRegistry) {
    this.commandRegister.registerLibroCommand(command, SnippetCommand, {
      async execute(_, libro) {
        if (!libro || !(libro instanceof LibroView)) {
          return;
        }
      },
      isVisible(_1, _2, path) {
        return path === LibroToolbarArea.HeaderRight;
      },
    });
  }

  registerToolbarItems(registry: ToolbarRegistry) {
    registry.registerItem({
      id: SnippetCommand.id,
      command: SnippetCommand.id,
      icon: SnippetView,
      order: '99',
    });
  }
}
