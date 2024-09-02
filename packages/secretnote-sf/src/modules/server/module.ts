import { ManaModule } from '@difizen/mana-app';

import { SecretNoteLanguageClientManager } from './language-client-manager';
import { SecretNoteServerManager } from './server-manager';

export const SecretNoteServerModule = ManaModule.create().register(
  SecretNoteServerManager,
  SecretNoteLanguageClientManager,
);
