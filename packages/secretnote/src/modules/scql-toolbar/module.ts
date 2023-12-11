import { ManaModule } from '@difizen/mana-app';

import { SCQLToolbarContribution } from './toolbar-contrib';

export const SCQLToolbarModule = ManaModule.create().register(SCQLToolbarContribution);
