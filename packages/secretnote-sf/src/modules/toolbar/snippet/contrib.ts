// Customized command to add snippet feature for SecretNote.

import {
  LibroCommandRegister,
  LibroToolbarArea,
  LibroView,
} from '@difizen/libro-jupyter';
import type { Command, CommandRegistry, ToolbarRegistry } from '@difizen/mana-app';
import {
  CommandContribution,
  inject,
  singleton,
  ToolbarContribution,
} from '@difizen/mana-app';

import { SecretNoteConfigService } from '@/modules/config';
import { isReadonly } from '@/utils';

import { SnippetView } from './view';

const SnippetCommand: Command = {
  id: 'notebook:snippet',
};
@singleton({ contrib: [CommandContribution, ToolbarContribution] })
export class SnippetContribution implements CommandContribution, ToolbarContribution {
  protected readonly commandRegister: LibroCommandRegister;
  protected readonly configService: SecretNoteConfigService;

  constructor(
    @inject(LibroCommandRegister) commandRegister: LibroCommandRegister,
    @inject(SecretNoteConfigService) configService: SecretNoteConfigService,
  ) {
    this.commandRegister = commandRegister;
    this.configService = configService;
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
    if (isReadonly(this.configService)) {
      return;
    }
    registry.registerItem({
      id: SnippetCommand.id,
      command: SnippetCommand.id,
      icon: SnippetView,
      order: '99',
    });
  }
}
