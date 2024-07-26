import type { LibroView } from '@difizen/libro-jupyter';
import type { LibroJupyterModel } from '@difizen/libro-jupyter';
import { NotebookCommands } from '@difizen/libro-jupyter';
import { CommandRegistry, useInject, ViewInstance } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { Tooltip } from 'antd';
import { PlayCircle } from 'lucide-react';
import React from 'react';

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
          <span>
            <div>{l10n.t('运行')}</div>
            <div>⌘ ↵</div>
          </span>
        }
      >
        <PlayCircle
          size={16}
          onClick={() => command.executeCommand(NotebookCommands.RunCell.id)}
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip
      overlayClassName="libro-tooltip-placement-right"
      placement="right"
      title={l10n.t('kernel准备中，无法执行')}
    >
      <PlayCircle size={16} color="#bfbfbf" />
    </Tooltip>
  );
};
