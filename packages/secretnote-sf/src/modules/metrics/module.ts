// Metrics provides CPU/MEM usage information of each node.

import { createViewPreference, ManaModule } from '@difizen/mana-app';

import { metricsMonitorKey } from '../layout';
import { MetricsService } from './service';
import { MetricsView } from './view';

export const MetricsModule = ManaModule.create().register(
  MetricsView,
  MetricsService,
  createViewPreference({
    slot: metricsMonitorKey,
    view: MetricsView,
    autoCreate: true,
  }),
);
