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

import { DataTableService } from './service';

export const ExtraComponent = () => {
  const instance = useInject<ExtraView>(ViewInstance);

  return (
    <Tooltip title={l10n.t('刷新')}>
      <RefreshCw
        size={14}
        onClick={(e) => {
          e.stopPropagation();
          instance.service.getDataTables();
          message.success(l10n.t('数据表已刷新'));
        }}
      />
    </Tooltip>
  );
};

@singleton()
@view('data-table-extra-view')
export class ExtraView extends BaseView {
  readonly service: DataTableService;

  view = ExtraComponent;

  constructor(@inject(DataTableService) service: DataTableService) {
    super();
    this.service = service;
  }
}
