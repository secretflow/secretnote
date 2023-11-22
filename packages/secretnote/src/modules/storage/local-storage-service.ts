import type { StorageService } from '@difizen/mana-app';
import { LocalStorageService, singleton } from '@difizen/mana-app';

@singleton()
export class SecretNoteLocalStorageService
  extends LocalStorageService
  implements StorageService
{
  protected prefix(key: string): string {
    return `secretnote:${key}`;
  }
}

export const localStorageService = new SecretNoteLocalStorageService();
