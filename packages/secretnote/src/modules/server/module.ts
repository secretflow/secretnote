import { ManaModule } from '@difizen/mana-app';

import { RequestService } from '@/utils';

import { SecretNoteServerManager } from './server-manager';

export const SecretNoteServerModule = ManaModule.create().register(
  RequestService,
  SecretNoteServerManager,
);
