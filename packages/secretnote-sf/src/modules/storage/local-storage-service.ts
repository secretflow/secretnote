// Service for local storage.

import type { StorageService } from '@difizen/mana-app';
import { LocalStorageService, singleton } from '@difizen/mana-app';

@singleton()
export class SecretNoteLocalStorageService
  extends LocalStorageService
  implements StorageService
{
  /**
   * Get the prefix for the key.
   */
  protected prefix(key: string): string {
    return `secretnote:${key}`;
  }
}

// manually create an instance of the service and inject it using `useValue`
// so that it can be used in somewhere without injection.
export const localStorageService = new SecretNoteLocalStorageService();
