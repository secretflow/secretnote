// The "Run" button in the top toolbar.

import type { LibroJupyterModel, LibroView } from '@difizen/libro-jupyter';
import { NotebookCommands } from '@difizen/libro-jupyter';
import { CommandRegistry, useInject, ViewInstance } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { Tooltip } from 'antd';
import { PlayCircle } from 'lucide-react';
import './index.less';

export const TopToolbarRunItem = () => {
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
          <span>
            <div>{l10n.t('运行所有 Cell')}</div>
          </span>
        }
      >
        <PlayCircle
          size={16}
          onClick={() =>
            command.executeCommand(NotebookCommands.RunAllCells.id)
          }
          className="libro-top-toolbar-run-icon"
        />
      </Tooltip>
    );
  } else {
    return (
      <Tooltip
        overlayClassName="libro-tooltip-placement-right"
        placement="right"
        title={l10n.t('Kernel 准备中，无法执行')}
      >
        <PlayCircle
          size={16}
          color="#bfbfbf"
          className="libro-top-toolbar-run-icon"
        />
      </Tooltip>
    );
  }
};
