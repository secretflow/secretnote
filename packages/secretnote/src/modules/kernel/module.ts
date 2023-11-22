import { ManaModule } from '@difizen/mana-app';

import { SecretNoteKernelManager } from './kernel-manager';

export const SecretNoteKernelModule = ManaModule.create().register(
  SecretNoteKernelManager,
);
