import { ManaModule } from '@difizen/mana-app';

import {
  KernelConnectionOptions,
  LibroKernelConnectionFactory,
} from '@difizen/libro-jupyter';
import { SecretNoteKernelConnection } from './kernel-connection';
import { SecretNoteKernelManager } from './kernel-manager';

export const SecretNoteKernelModule = ManaModule.create().register(
  SecretNoteKernelManager,
  SecretNoteKernelConnection,
  // replace the default kernel connection factory with our customized one
  {
    token: LibroKernelConnectionFactory,
    useFactory: (ctx) => {
      return (options: KernelConnectionOptions) => {
        const child = ctx.container.createChild();
        child.register({
          token: KernelConnectionOptions,
          useValue: options,
        });
        return child.get(SecretNoteKernelConnection);
      };
    },
  },
);
