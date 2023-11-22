import { ManaModule } from '@difizen/mana-app';

import { MetricsService } from './service';
import { MetricsToolbarContribution } from './toolbar-contrib';

export const MetricsModule = ManaModule.create().register(
  MetricsToolbarContribution,
  MetricsService,
);
