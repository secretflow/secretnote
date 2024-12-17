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

import { TableService } from '@/modules/scql-table/service';
import { genericErrorHandler } from '@/utils';

export const ExtraComponent = () => {
  const { tableService } = useInject<ExtraView>(ViewInstance);

  return (
    <Tooltip title={l10n.t('刷新')}>
      <RefreshCw
        size={14}
        onClick={(e) => {
          e.stopPropagation();
          tableService
            .refreshTables()
            .then(() => message.success(l10n.t('数据表已刷新')))
            .catch(genericErrorHandler);
        }}
      />
    </Tooltip>
  );
};

@singleton()
@view('data-table-extra-view')
export class ExtraView extends BaseView {
  readonly tableService: TableService;
  view = ExtraComponent;

  constructor(@inject(TableService) tableService: TableService) {
    super();
    this.tableService = tableService;
  }
}
