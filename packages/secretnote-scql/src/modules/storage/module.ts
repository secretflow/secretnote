import { ManaModule, StorageService } from '@difizen/mana-app';

import { localStorageService } from './local-storage-service';

export const StorageModule = ManaModule.create().register({
  token: StorageService,
  useValue: localStorageService,
});
