// The refresh button of the table tree sidebar.

import {
  BaseView,
  inject,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { message, Tooltip } from 'antd';
import { RefreshCw } from 'lucide-react';
import { TableService } from './service';

export const ExtraComponent = () => {
  const { service } = useInject<ExtraView>(ViewInstance);

  return (
    <Tooltip title={l10n.t('刷新')}>
      <RefreshCw
        size={14}
        onClick={(e) => {
          e.stopPropagation();
          service.refreshTables();
          message.success(l10n.t('数据表已刷新'));
        }}
      />
    </Tooltip>
  );
};

@singleton()
@view('data-table-extra-view')
export class ExtraView extends BaseView {
  readonly service: TableService;
  view = ExtraComponent;

  constructor(@inject(TableService) service: TableService) {
    super();
    this.service = service;
  }
}
