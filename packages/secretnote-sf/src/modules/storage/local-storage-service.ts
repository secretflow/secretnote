// Service for local storage.

import type { StorageService } from '@difizen/mana-app';
import { LocalStorageService, singleton } from '@difizen/mana-app';

import type { ISecretNoteAppProps } from '@/.';

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

// Manually create an instance of the service and register it using `useValue`
// so that it can be used in somewhere without injection.
export const localStorageService = new SecretNoteLocalStorageService();

/**
 * Get the global config (injected as component props) from local storage.
 */
export function getGlobalConfig() {
  return localStorageService.getData('globalConfig') as ISecretNoteAppProps | undefined;
}
