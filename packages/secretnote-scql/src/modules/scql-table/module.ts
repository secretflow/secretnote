import { createViewPreference, ManaModule } from '@difizen/mana-app';

import { ExtraView } from './extra-view';
import { DataTableService } from './service';
import { DataTableView, dataTableViewKey } from './view';

export const SCQLDataTableModule = ManaModule.create().register(
  DataTableService,
  DataTableView,
  ExtraView,
  createViewPreference({
    slot: dataTableViewKey,
    view: DataTableView,
    autoCreate: true,
  }),
  createViewPreference({
    slot: `${dataTableViewKey}Extra`,
    view: ExtraView,
    autoCreate: true,
  }),
);
