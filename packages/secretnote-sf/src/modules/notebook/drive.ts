// Customized contents drive for SecretNote which sends contents API requests to the default server properly.
// The main logics are borrowed from the default Drive @difizen/libro-kernel/src/contents/contents-drive.ts,
// but the request method are overriden instead of using the globally injected one.
// To make it short, shared comments are removed. Please refer to the original source file if you need.

import type {
  IContentsChangedArgs,
  IContentsDrive,
  ServerConnection,
} from '@difizen/libro-jupyter';
import { Drive as DefaultDrive } from '@difizen/libro-jupyter';
import { Emitter, singleton } from '@difizen/mana-app';

import {
  createNotImplemented,
  getDefaultServerConnectionSettings,
  getRemoteBaseUrl,
  requestNoUnpack,
} from '@/utils';

/**
 * Name of the customized drive.
 */
export const DriveName = 'SecretNoteContentsDrive';

@singleton()
export class SecretNoteContentsDrive implements IContentsDrive {
  readonly name = DriveName; // Name of drive, used as the leading component of file paths.
  protected apiEndpoint = 'api/contents';
  protected _isDisposed = false;
  protected fileChangedEmitter = new Emitter<IContentsChangedArgs>();

  /**
   * Customized server connection that partially implemented the original one.
   * This server connections goes to the default web server instead of Jupyter Server.
   * @override `@inject(ServerConnection)`
   */
  serverConnection: {
    makeRequest: ServerConnection['makeRequest'];
    settings: {
      baseUrl: string;
    } & Partial<ServerConnection['settings']>;
  } = {
    makeRequest: async (url, init, settings) => {
      // Settings are always globally defined, temporarily overriden is not allowed.
      // Also, the escape hatch by setting options.baseUrl is not recommended unless you know what you are doing.
      if (settings) {
        throw new Error('`settings` is not allowed to be overriden.');
      }
      return requestNoUnpack(url, init, /*targetId*/ '');
    },
    settings: {
      baseUrl: '', // `requestNoUnpack` will handle the prepending baseUrl things according to targetId, just leave it empty.
      wsUrl: '', // contents API doesn't care about WebSocket. pass anything.
      ...getDefaultServerConnectionSettings(),
    },
  };

  // inherited getters
  get fileChanged() {
    return this.fileChangedEmitter.event;
  }
  get isDisposed() {
    return this._isDisposed;
  }

  // inherited implementations
  dispose = DefaultDrive.prototype.dispose.bind(this);
  get = DefaultDrive.prototype.get.bind(this);
  newUntitled = DefaultDrive.prototype.newUntitled.bind(this);
  delete = DefaultDrive.prototype.delete.bind(this);
  rename = DefaultDrive.prototype.rename.bind(this);
  save = DefaultDrive.prototype.save.bind(this);
  copy = DefaultDrive.prototype.copy.bind(this);
  // this one is special because its internal doesn't use `makeRequest` directly
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getDownloadUrl = async (localPath: string, ...args: any) => {
    const baseUrl = getRemoteBaseUrl();
    // so we need to override its baseUrl temporarily to let it work
    const fullURL = await DefaultDrive.prototype.getDownloadUrl.call(this, localPath, {
      baseUrl,
    });
    // and to make it consistent with other API in this drive
    // we manually remove the baseUrl from the result then
    return fullURL.replace(new RegExp(`^${baseUrl}/?`), '');
  };

  // omit all checkpoint APIs because SecretNote doesn't support this feature
  createCheckpoint = createNotImplemented('createCheckpoint');
  listCheckpoints = createNotImplemented('listCheckpoints');
  restoreCheckpoint = createNotImplemented('restoreCheckpoint');
  deleteCheckpoint = createNotImplemented('deleteCheckpoint');

  // utilities
  getUrl = DefaultDrive.prototype['getUrl'].bind(this); // bypass the `protected` annotation
  /**
   * Not allowed to override settings used by makeRequest here. Return nothing.
   * @override Drive._getSettings
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected _getSettings(...args: any) /* :ISettings */ {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return void 0;
  }
}
