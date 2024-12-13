// The "Run" button in the top toolbar.

import {
  NotebookCommands,
  type LibroJupyterModel,
  type LibroView,
} from '@difizen/libro-jupyter';
import { CommandRegistry, useInject, ViewInstance } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { Tooltip } from 'antd';
import {
  ArrowDownFromLine,
  ArrowUpFromLine,
  FastForward,
  Play,
  PlayCircle,
} from 'lucide-react';

import { DropdownMenu } from '@/components/dropdown-menu';
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
        title={l10n.t('运行')}
        placement="bottom"
        trigger="hover"
        overlayClassName="libro-tooltip-placement-right"
        autoAdjustOverflow={false}
      >
        <DropdownMenu
          icon={<PlayCircle className="libro-top-toolbar-custom-icon" size={18} />}
          trigger={['hover']}
          items={[
            {
              key: 'RunCell',
              label: l10n.t('执行当前 Cell'),
              icon: <Play size={14} />,
            },
            {
              key: 'RunAllCells',
              label: l10n.t('执行所有 Cell'),
              icon: <FastForward size={14} />,
            },
            {
              key: 'RunAllAbove',
              label: l10n.t('执行上方所有 Cell'),
              icon: <ArrowUpFromLine size={14} />,
            },
            {
              key: 'RunAllBelow',
              label: l10n.t('执行下方所有 Cell'),
              icon: <ArrowDownFromLine size={14} />,
            },
          ]}
          onClick={(key) => command.executeCommand(NotebookCommands[key].id)}
        />
      </Tooltip>
    );
  } else {
    return (
      <Tooltip
        title={l10n.t('Kernel 忙或不存在，无法执行')}
        placement="bottom"
        trigger="hover"
        overlayClassName="libro-tooltip-placement-right"
      >
        <PlayCircle
          size={18}
          color="#bfbfbf"
          className="libro-top-toolbar-custom-icon"
        />
      </Tooltip>
    );
  }
};
