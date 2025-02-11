// Global config service that loads props from top level <App>.

import { singleton } from '@difizen/mana-app';

import type { ISecretNotePreviewProps } from '@/pages/sf-preview';
import type { ISecretNoteWorkspaceProps } from '@/pages/sf-workspace';
import type { ValueOf } from '@/utils';

type ISecretNoteAppProps = ISecretNoteWorkspaceProps & ISecretNotePreviewProps;

export const SecretNoteConfigLocalStorageKey = 'secretnote:config';

/**
 * This function helps to get the config from the localStorage
 * for those scenarios that we are not working with Mana.
 */
export function getSecretNoteConfig() {
  return JSON.parse(
    localStorage.getItem(SecretNoteConfigLocalStorageKey) || '{}',
  ) as ISecretNoteAppProps;
}

@singleton()
export class SecretNoteConfigService {
  protected config: ISecretNoteAppProps = {};

  constructor() {
    // load config from localStorage
    this.config = getSecretNoteConfig();
  }

  setItem(
    key: keyof ISecretNoteAppProps,
    value: ISecretNoteAppProps[keyof ISecretNoteAppProps],
  ) {
    // update the config and sync it to localStorage
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.config[key] = value;
    localStorage.setItem(SecretNoteConfigLocalStorageKey, JSON.stringify(this.config));
  }

  getItem<T = ValueOf<ISecretNoteAppProps>>(key: keyof ISecretNoteAppProps) {
    return this.config[key] as T;
  }
}
