import { ServerConnection } from '@difizen/libro-jupyter';
import { ManaModule } from '@difizen/mana-app';

import { RequestService } from './service';

export const RequestModule = ManaModule.create().register(
  RequestService,
  ServerConnection,
);
