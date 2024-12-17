// The "Run" button in the side toolbar of each cell.

import type { LibroJupyterModel, LibroView } from '@difizen/libro-jupyter';
import { NotebookCommands } from '@difizen/libro-jupyter';
import { CommandRegistry, useInject, ViewInstance } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { Tooltip } from 'antd';
import { PlayCircle } from 'lucide-react';

import { CmdOrCtrl } from './keybind-instruction';

export const SideToolbarRunItem = () => {
  const libroView = useInject<LibroView>(ViewInstance);
  const libroModel = libroView ? libroView.model : undefined;
  const command = useInject<CommandRegistry>(CommandRegistry);
  const isKernelIdle = libroModel
    ? (libroModel as LibroJupyterModel).isKernelIdle
    : false;

  if (isKernelIdle) {
    return (
      <Tooltip
        placement="left"
        autoAdjustOverflow={false}
        overlayClassName="libro-tooltip-placement-right"
        title={
          <div className="libro-side-tooltip">
            <div className="libro-tooltip-text">{l10n.t('运行')}</div>
            <div className="libro-tooltip-keybind">{`${CmdOrCtrl}+Enter`}</div>
          </div>
        }
      >
        <PlayCircle
          size={16}
          onClick={() => command.executeCommand(NotebookCommands.RunCell.id)}
        />
      </Tooltip>
    );
  } else {
    return (
      <Tooltip
        overlayClassName="libro-tooltip-placement-right"
        placement="right"
        title={l10n.t('Kernel 忙或不存在，无法执行')}
      >
        <PlayCircle size={16} color="#bfbfbf" />
      </Tooltip>
    );
  }
};
