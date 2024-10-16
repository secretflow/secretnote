import { ManaModule } from '@difizen/mana-app';

import { SecretNoteColorContribution } from './color-registry';

export const ThemeModule = ManaModule.create().register(SecretNoteColorContribution);
