import { createViewPreference, ManaModule } from '@difizen/mana-app';

import { ExtraView } from './extra-view';
import { MySQLIntegration } from './mysql-contrib';
import { IntegrationMetaContribution } from './protocol';
import { IntegrationService } from './service';
import { IntegrationView, integrationViewKey } from './view';

export const IntegrationModule = ManaModule.create()
  .contribution(IntegrationMetaContribution)
  .register(
    ExtraView,
    IntegrationView,
    IntegrationService,
    MySQLIntegration,
    createViewPreference({
      slot: integrationViewKey,
      view: IntegrationView,
      autoCreate: true,
    }),
    createViewPreference({
      slot: `${integrationViewKey}Extra`,
      view: ExtraView,
      autoCreate: true,
    }),
  );
