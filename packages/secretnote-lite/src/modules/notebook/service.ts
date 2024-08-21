// Services for notebook manupulation.

import type { IContentsModel, LibroView } from '@difizen/libro-jupyter';
import { ContentsManager, ServerConnection } from '@difizen/libro-jupyter';
import { Emitter, inject, prop, singleton } from '@difizen/mana-app';

import {
  downloadFileByURL,
  getDefaultConnectionSettings,
  getRemoteBaseUrl,
  getRemoteWsUrl,
} from '@/utils';
import { l10n } from '@difizen/mana-l10n';
import { AtLeast } from 'typings';

const USER_ROOT_DIR = '/'; // the root path for a user's notebook files with trailing slash
const FILE_EXT = '.ipynb'; // the default extname of notebook files

@singleton()
export class NotebookFileService {
  protected readonly serverConnection: ServerConnection;
  // contents manager is for notebook file management
  // @see https://jupyter-server.readthedocs.io/en/latest/developers/contents.html
  protected readonly contentsManager: ContentsManager;
  // notebook file changed event
  protected readonly onNotebookFileChangedEmitter = new Emitter<{
    pre: IContentsModel | null;
    cur: IContentsModel;
  }>();
  readonly onNotebookFileChanged = this.onNotebookFileChangedEmitter.event;

  @prop() notebookFileList: IContentsModel[] = [];
  @prop() currentNotebookFile: IContentsModel | null = null;
  @prop() currentLibroView: LibroView | null = null;
  @prop() pendingRename: { path: string; name: string } | null = null;

  constructor(
    @inject(ServerConnection) serverConnection: ServerConnection,
    @inject(ContentsManager) contentsManager: ContentsManager,
  ) {
    this.serverConnection = serverConnection;
    this.contentsManager = contentsManager;
    // API call inside ContentsManager requires request URL to start with ServerConnection's baseUrl
    // so we must update the baseUrl of ServerConnection here
    this.serverConnection.updateSettings({
      // all notebook files API (except execution) goes to the default web server
      baseUrl: getRemoteBaseUrl(),
      wsUrl: getRemoteWsUrl(),
      ...getDefaultConnectionSettings(),
    });
    // baseUrl of ContentsManager cannot be globally overridden
    // so we must specified it in every API call
  }

  /**
   * Open a new notebook file.
   */
  openFile(file: IContentsModel) {
    if (this.currentNotebookFile !== file) {
      const previous = this.currentNotebookFile;
      this.currentNotebookFile = file;
      this.onNotebookFileChangedEmitter.fire({
        pre: previous,
        cur: file,
      });
    }
  }

  /**
   * Get file list in the base path of current user.
   * @see https://jupyter-server.readthedocs.io/en/latest/developers/rest-api.html#get--api-contents-path
   */
  async getFileList() {
    const { content } = (await this.contentsManager.get(USER_ROOT_DIR, {
      baseUrl: getRemoteBaseUrl(), // contents API has been migrated to the default web server
      content: true,
      type: 'directory',
    })) as AtLeast<{ content: IContentsModel[] }>;
    // show only notebook files, sort by name
    this.notebookFileList = content
      .filter(({ name }) => name.endsWith(FILE_EXT))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Commit the rename action.
   * The renaming is a two-step process.
   */
  async renameFile() {
    // if there is a pending rename action
    if (this.pendingRename) {
      const { path, name } = this.pendingRename;
      // and it's valid
      if (path && name) {
        // find the source file
        const file = this.notebookFileList.find((file) => file.path === path);
        // and the target name is different
        if (file && file.name !== name) {
          const newPath = path.replace(file.name, name);
          // check if the target file name is already existed
          if (await this.isFileExisted(newPath)) {
            throw new Error(l10n.t('目标文件名已存在'));
          }
          // fire the rename action
          const newFile = await this.contentsManager.rename(path, newPath, {
            baseUrl: getRemoteBaseUrl(),
          });
          await this.getFileList();
          // replace the current file if it's the one being renamed
          if (this.currentNotebookFile?.path === path) {
            this.currentNotebookFile = newFile;
          }
        }
      }
    }
    this.pendingRename = null; // no matter what, clear the pending rename action
  }

  /**
   * Create a new notebook file.
   */
  async addFile() {
    const file = await this.contentsManager.newUntitled({
      baseUrl: getRemoteBaseUrl(),
      path: USER_ROOT_DIR, // no nested directory is allowed currently
      type: 'notebook',
    });
    // update the file list and open the new file
    await this.getFileList();
    this.openFile(file);
    this.pendingRename = {
      path: file.path,
      name: file.name,
    };
  }

  /**
   * Delete a notebook file.
   */
  async deleteFile(file: IContentsModel) {
    await this.contentsManager.delete(file.path, {
      baseUrl: getRemoteBaseUrl(),
    });
    // close the file if the being-deleted is the current one
    if (this.currentNotebookFile?.path === file.path) {
      this.currentNotebookFile = null;
    }
    await this.getFileList();
  }

  /**
   * Export (download) a notebook file.
   */
  async exportFile(file: IContentsModel) {
    const downloadURL = await this.contentsManager.getDownloadUrl(file.path, {
      baseUrl: getRemoteBaseUrl(),
    });
    const resp = await this.serverConnection.makeRequest(downloadURL, {
      method: 'GET',
    });
    if (resp.status === 200) {
      // it's guaranteed that the response is the file content itself instead of some error message
      // when the status code is 200
      downloadFileByURL(
        window.URL.createObjectURL(await resp.blob()),
        file.name,
      );
    }
  }

  /**
   * Copy a notebook file.
   */
  async copyFile(file: IContentsModel) {
    const newFile = await this.contentsManager.copy(file.path, USER_ROOT_DIR, {
      baseUrl: getRemoteBaseUrl(),
    });
    await this.getFileList();
    this.openFile(newFile);
  }

  /**
   * Check if a file exists.
   */
  async isFileExisted(name: string) {
    const { content } = (await this.contentsManager.get(USER_ROOT_DIR, {
      baseUrl: getRemoteBaseUrl(),
      content: true,
      type: 'directory',
    })) as AtLeast<{ content: IContentsModel[] }>;
    // in SecretNote there is no nested directory, so we can check by name or path
    return content.some((file) => file.name === name || file.path === name);
  }

  /**
   * Upload a notebook file.
   */
  async uploadFile(name: string, content: string) {
    await this.contentsManager.save(`${USER_ROOT_DIR}${name}`, {
      baseUrl: getRemoteBaseUrl(),
      type: 'notebook',
      content: JSON.parse(content),
      format: 'json',
    });
    // refresh the file list
    await this.getFileList();
  }

  createPendingRename(file: IContentsModel) {
    return {
      path: file.path,
      name: file.name,
    };
  }

  getFileNameWithoutExt(name?: string) {
    if (!name) {
      return '';
    }
    return name.endsWith(FILE_EXT) ? name.replace(FILE_EXT, '') : name;
  }

  getFileNameWithExt(name?: string) {
    if (!name) {
      return '';
    }
    return name.endsWith(FILE_EXT) ? name : `${name}${FILE_EXT}`;
  }
}
