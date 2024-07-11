import { ManaModule } from '@difizen/mana-app';

import { SecretNoteToolbarContribution } from './toolbar-contrib';

export const ToolbarModule = ManaModule.create().register(
  SecretNoteToolbarContribution,
);
