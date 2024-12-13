// Metrics provides CPU/MEM usage information of each node.

import { createViewPreference, ManaModule } from '@difizen/mana-app';

import { metricsMonitorKey } from '@/modules/layout';
import { MetricsService } from '@/modules/metrics/service';
import { MetricsView } from '@/modules/metrics/view';

export const MetricsModule = ManaModule.create().register(
  MetricsView,
  MetricsService,
  createViewPreference({
    slot: metricsMonitorKey,
    view: MetricsView,
    autoCreate: true,
  }),
);
