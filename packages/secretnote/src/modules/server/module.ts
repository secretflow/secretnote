import { ManaModule } from '@difizen/mana-app';

import { SecretNoteServerManager } from './server-manager';

export const SecretNoteServerModule = ManaModule.create().register(
  SecretNoteServerManager,
);
