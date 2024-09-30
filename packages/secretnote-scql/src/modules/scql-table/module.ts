import { createViewPreference, ManaModule } from '@difizen/mana-app';

import { ExtraView } from './extra-view';
import { TableService } from './service';
import { TableView, tableViewKey } from './view';

export const SCQLTableModule = ManaModule.create().register(
  TableService,
  TableView,
  ExtraView,
  createViewPreference({
    slot: tableViewKey,
    view: TableView,
    autoCreate: true,
  }),
  createViewPreference({
    slot: `${tableViewKey}Extra`,
    view: ExtraView,
    autoCreate: true,
  }),
);
