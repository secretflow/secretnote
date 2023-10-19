import { ManaModule } from '@difizen/mana-app';

import { SecretNoteServerLaunchManager } from './server-launch-manager';
import { SecretNoteServerManager } from './server-manager';

export const SecretNoteServerModule = ManaModule.create().register(
  SecretNoteServerManager,
  SecretNoteServerLaunchManager,
);
