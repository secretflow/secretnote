import {
  LibroCommandRegister,
  LibroToolbarArea,
  LibroView,
} from '@difizen/libro-jupyter';
import type { CommandRegistry, ToolbarRegistry } from '@difizen/mana-app';
import {
  CommandContribution,
  inject,
  ModalContribution,
  ModalService,
  singleton,
  ToolbarContribution,
  useInject,
} from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { AreaChart } from 'lucide-react';

import { MetricsModal } from './view';

const MetricsPanelOpenCommand = {
  id: 'metrics-panel-open',
};

const MetricsIcon = () => {
  const modalService = useInject(ModalService);
  const handleClick = () => {
    modalService.openModal(MetricsModal);
  };

  return (
    <AreaChart
      onClick={handleClick}
      size={16}
      style={{ color: '#7b7b7b', marginTop: 5 }}
    />
  );
};

@singleton({ contrib: [CommandContribution, ToolbarContribution, ModalContribution] })
export class MetricsToolbarContribution
  implements CommandContribution, ToolbarContribution, ModalContribution
{
  protected readonly libroCommand: LibroCommandRegister;

  constructor(@inject(LibroCommandRegister) libroCommand: LibroCommandRegister) {
    this.libroCommand = libroCommand;
  }

  registerCommands(command: CommandRegistry) {
    this.libroCommand.registerLibroCommand(command, MetricsPanelOpenCommand, {
      execute: async (cell, libro) => {
        if (!libro || !(libro instanceof LibroView)) {
          return;
        }
      },
      isVisible: (cell, libro, path) => {
        return path === LibroToolbarArea.HeaderRight;
      },
      isEnabled: (cell, libro) => {
        if (!libro || !(libro instanceof LibroView)) {
          return false;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return !!(libro.model as any).kernelConnection;
      },
    });
  }

  registerToolbarItems(registry: ToolbarRegistry) {
    registry.registerItem({
      id: MetricsPanelOpenCommand.id,
      icon: MetricsIcon,
      command: MetricsPanelOpenCommand.id,
      order: 'a',
      tooltip: l10n.t('查看状态'),
    });
  }

  registerModal() {
    return MetricsModal;
  }
}
