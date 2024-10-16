// Node module is for node management displayed on right-top of the header area.

import { createViewPreference, ManaModule } from '@difizen/mana-app';

import { HeaderArea } from '@/modules/layout';
import { NodeService } from './service';
import { NodeView } from './view';

export const NodeModule = ManaModule.create().register(
  NodeView,
  NodeService,
  createViewPreference({
    slot: HeaderArea.right,
    view: NodeView,
    autoCreate: true,
  }),
);
