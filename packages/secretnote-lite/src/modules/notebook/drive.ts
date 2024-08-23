// Customized contents drive for SecretNote which sends contents API requests to the default server properly.
// The main logics are borrowed from the default Drive @difizen/libro-kernel/src/contents/contents-drive.ts,
// but the request method are overriden instead of using the globally injected one.
// To make it short, comments inside functions are removed. Please refer to the original source file if you need.

import {
  getDefaultServerConnectionSettings,
  normalizeExtension,
  querystringStringify,
  requestNoUnpack,
} from '@/utils';
import type { JSONPrimitive, ServerConnection } from '@difizen/libro-jupyter';
import { URL as URLUtil } from '@difizen/libro-jupyter';
import type {
  IContentsChangedArgs,
  IContentsCreateOptions,
  IContentsDrive,
  IContentsFetchOptions,
  IContentsModel,
  IContentsRequestOptions,
} from '@difizen/libro-kernel';
import {
  createResponseError,
  validateContentsModel,
} from '@difizen/libro-kernel';
import type { Event as ManaEvent } from '@difizen/mana-app';
import { Emitter, singleton } from '@difizen/mana-app';

/**
 * Name of the customized drive.
 */
export const DriveName = 'SecretNoteContentsDrive';

@singleton()
export class SecretNoteContentsDrive implements IContentsDrive {
  // The name of the drive, which is used at the leading component of file paths.
  readonly name: string = DriveName;
  protected apiEndpoint: string = 'api/contents';
  protected _isDisposed = false;
  protected fileChangedEmitter = new Emitter<IContentsChangedArgs>();

  /**
   * Customized server connection that partially implemented the original one.
   * This server connections goes to the default web server instead of Jupyter Server.
   */
  serverConnection: {
    makeRequest: ServerConnection['makeRequest'];
    settings: {
      baseUrl: string;
    } & Partial<ServerConnection['settings']>;
  } = {
    makeRequest: async (url, init, settings) => {
      // Settings are always globally defined, temporarily overriden is not allowed.
      // Also, the hatch by setting options.baseUrl is not recommended unless you know what you are doing.
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

  /**
   * A signal emitted when a file operation takes place.
   */
  get fileChanged(): ManaEvent<IContentsChangedArgs> {
    return this.fileChangedEmitter.event;
  }

  /**
   * Test whether the manager has been disposed.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Dispose of the resources held by the manager.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._isDisposed = true;
    this.fileChangedEmitter.dispose();
  }

  /**
   * Get a file or directory.
   */
  async get(localPath: string, options?: IContentsFetchOptions) {
    let url = this.getUrl(options?.baseUrl, localPath);
    if (options) {
      if (options.type === 'notebook') {
        delete options.format;
      }
      if (options.baseUrl) {
        delete options.baseUrl;
      }
      const content = options.content ? '1' : '0';
      const params: Record<string, JSONPrimitive> = { ...options, content };
      url += `?${querystringStringify(params)}`;
    }
    const response = await this.serverConnection.makeRequest(url, {});
    if (response.status !== 200) {
      throw await createResponseError(response);
    }
    const data = await response.json();
    validateContentsModel(data);
    return data;
  }

  /**
   * Get an encoded download url given a file path.
   */
  getDownloadUrl(localPath: string, options?: IContentsRequestOptions) {
    const baseUrl = options?.baseUrl || this.serverConnection.settings.baseUrl;
    let url = URLUtil.join(baseUrl, 'files', URLUtil.encodeParts(localPath));
    const xsrfTokenMatch = document.cookie.match('\\b_xsrf=([^;]*)\\b');
    if (xsrfTokenMatch) {
      const fullUrl = new URL(url);
      fullUrl.searchParams.append('_xsrf', xsrfTokenMatch[1]);
      url = fullUrl.toString();
    }
    return Promise.resolve(url);
  }

  /**
   * Create a new untitled file or directory in the specified directory path.
   */
  async newUntitled(options: IContentsCreateOptions = {}) {
    let body = '{}';
    const url = this.getUrl(options.baseUrl, options.path ?? '');
    if (options) {
      if (options.ext) {
        options.ext = normalizeExtension(options.ext);
      }
      if (options.baseUrl) {
        delete options.baseUrl;
      }
      body = JSON.stringify(options);
    }
    const response = await this.serverConnection.makeRequest(url, {
      method: 'POST',
      body,
    });
    if (response.status !== 201) {
      throw await createResponseError(response);
    }
    const data = await response.json();
    validateContentsModel(data);
    this.fileChangedEmitter.fire({
      type: 'new',
      oldValue: null,
      newValue: data,
    });
    return data;
  }

  /**
   * Delete a file.
   */
  async delete(localPath: string, options?: IContentsRequestOptions) {
    const url = this.getUrl(options?.baseUrl, localPath);
    const response = await this.serverConnection.makeRequest(url, {
      method: 'DELETE',
    });
    if (response.status !== 204) {
      throw await createResponseError(response);
    }
    this.fileChangedEmitter.fire({
      type: 'delete',
      oldValue: { path: localPath },
      newValue: null,
    });
  }

  /**
   * Rename a file or directory.
   */
  async rename(
    oldLocalPath: string,
    newLocalPath: string,
    options?: IContentsRequestOptions,
  ) {
    const url = this.getUrl(options?.baseUrl, oldLocalPath);
    const response = await this.serverConnection.makeRequest(url, {
      method: 'PATCH',
      body: JSON.stringify({ path: newLocalPath }),
    });
    if (response.status !== 200) {
      throw await createResponseError(response);
    }
    const data = await response.json();
    validateContentsModel(data);
    this.fileChangedEmitter.fire({
      type: 'rename',
      oldValue: { path: oldLocalPath },
      newValue: data,
    });
    return data;
  }

  /**
   * Save a file.
   */
  async save(
    localPath: string,
    options: Partial<IContentsModel> = {},
  ): Promise<IContentsModel> {
    const url = this.getUrl(options.baseUrl, localPath);
    if (options) {
      if (options.baseUrl) {
        delete options.baseUrl;
      }
    }
    const response = await this.serverConnection.makeRequest(url, {
      method: 'PUT',
      body: JSON.stringify(options),
    });
    // will return 200 for an existing file and 201 for a new file
    if (response.status !== 200 && response.status !== 201) {
      throw await createResponseError(response);
    }
    const data = await response.json();
    validateContentsModel(data);
    this.fileChangedEmitter.fire({
      type: 'save',
      oldValue: null,
      newValue: data,
    });
    return data;
  }

  /**
   * Copy a file into a given directory.
   */
  async copy(
    fromFile: string,
    toDir: string,
    options?: IContentsRequestOptions,
  ): Promise<IContentsModel> {
    const url = this.getUrl(options?.baseUrl, toDir);
    const response = await this.serverConnection.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify({ copy_from: fromFile }),
    });
    if (response.status !== 201) {
      throw await createResponseError(response);
    }
    const data = await response.json();
    validateContentsModel(data);
    this.fileChangedEmitter.fire({
      type: 'new',
      oldValue: null,
      newValue: data,
    });
    return data;
  }

  // Omit all checkpoint APIs because SecretNote doesn't support this feature.
  createCheckpoint(...args: any) {
    throw new Error('`createCheckpoint` is not implemented.');
    return void 0 as any;
  }
  listCheckpoints(...args: any) {
    throw new Error('`listCheckpoints` is not implemented.');
    return void 0 as any;
  }
  restoreCheckpoint(...args: any) {
    throw new Error('`restoreCheckpoint` is not implemented.');
    return void 0 as any;
  }
  deleteCheckpoint(...args: any) {
    throw new Error('`deleteCheckpoint` is not implemented.');
    return void 0 as any;
  }

  /**
   * Get a REST url for a file given a path.
   */
  protected getUrl(base?: string, ...args: string[]): string {
    let baseUrl = base;
    if (!baseUrl) {
      baseUrl = this.serverConnection.settings.baseUrl;
    }
    const parts = args.map((path) => URLUtil.encodeParts(path));
    return URLUtil.join(baseUrl!, this.apiEndpoint, ...parts);
  }
}
