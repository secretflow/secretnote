// Services for notebook manupulation.

import type {
  ContentsFileFormat,
  IContentsModel,
  INotebookContent,
  LibroView,
} from '@difizen/libro-jupyter';
import { ContentsManager, ServerConnection } from '@difizen/libro-jupyter';
import { Emitter, inject, prop, singleton } from '@difizen/mana-app';

import { downloadFileByURL, requestNoUnpack } from '@/utils';
import { l10n } from '@difizen/mana-l10n';

import { DriveName, SecretNoteContentsDrive } from './drive';

const USER_ROOT_DIR = '/'; // the root path for a user's notebook files with trailing slash
const FILE_EXT = '.ipynb'; // the default extname of notebook files

/**
 * Add the customized drive name to the path so that
 * ContentsManager will call that drive to fire requests.
 */
export const drived = (path: string, driveName = DriveName) => `${driveName}:${path}`;
/**
 * Remove the drive name and leading slash from the path if any.
 */
export const undrived = (path: string, driveName = DriveName) =>
  path.replace(new RegExp(`^${driveName}:/?`), '');

@singleton()
export class NotebookFileService {
  protected readonly serverConnection: ServerConnection;
  // contents manager is for notebook file management
  // @see https://jupyter-server.readthedocs.io/en/latest/developers/contents.html
  protected readonly contentsManager: ContentsManager;
  // With a new drive. The `drived` and `undrived` operations are constrained inside
  // the service and the downstream should not be aware of the drive.
  protected readonly contentsDrive: SecretNoteContentsDrive;
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
    @inject(SecretNoteContentsDrive) contentsDrive: SecretNoteContentsDrive,
  ) {
    this.serverConnection = serverConnection;
    this.contentsManager = contentsManager;
    // Contents API has been taken over by the default web server.
    // However, the default drive for ContentsManager will send contents API requests
    // to the Jupyter Server instead. So we must use a new Drive to customize
    // our requests here.
    this.contentsDrive = contentsDrive;
    this.contentsManager.addDrive(this.contentsDrive);
  }

  /**
   * Open a new notebook file.
   * @see `loadContent` in `/editor/contents/contents-contrib.ts`
   */
  openFile(file: IContentsModel) {
    console.log('openFile', file);
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
    const { content } = (await this.contentsManager.get(drived(USER_ROOT_DIR), {
      content: true,
      type: 'directory',
    })) as { content: IContentsModel[] } & { [key: string]: any };
    // show only notebook files, sort by name
    this.notebookFileList = content
      .filter(({ name }) => name.endsWith(FILE_EXT))
      .map((v) => ({
        ...v,
        path: undrived(v.path), // do not let the downstream see the drive
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Open a notebook file to get its ContentsModel by path.
   */
  async getFile(path: string) {
    const file = await this.contentsManager.get(drived(path), {
      content: true,
      type: 'file',
    });
    file.path = undrived(file.path); // do not let the upstream see the drive
    return file;
  }

  /**
   * Save a notebook file.
   */
  async saveFile(
    path: string,
    options: {
      type: string;
      content: INotebookContent;
      format?: ContentsFileFormat;
    },
  ) {
    const file = await this.contentsManager.save(drived(path), options);
    file.path = undrived(file.path); // do not let the upstream see the drive
    return file;
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
          const newFile = await this.contentsManager.rename(
            drived(path),
            drived(newPath),
          );
          newFile.path = undrived(newFile.path); // do not let the downstream see the drive
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
      path: drived(USER_ROOT_DIR), // no nested directory is allowed currently
      type: 'notebook',
    });
    file.path = undrived(file.path); // do not let the upstream see the drive
    // update the file list and open the new file
    await this.getFileList();
    this.openFile(file);
  }

  /**
   * Delete a notebook file.
   */
  async deleteFile(file: IContentsModel) {
    await this.contentsManager.delete(drived(file.path));
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
    const downloadURL = await this.contentsManager.getDownloadUrl(drived(file.path));
    const resp = await requestNoUnpack(downloadURL, {
      method: 'GET',
    });
    if (resp.status === 200) {
      // it's guaranteed that the response is the file content itself instead of some error message
      // when the status code is 200
      downloadFileByURL(window.URL.createObjectURL(await resp.blob()), file.name);
    }
  }

  /**
   * Copy a notebook file.
   */
  async copyFile(file: IContentsModel) {
    const newFile = await this.contentsManager.copy(
      drived(file.path),
      drived(USER_ROOT_DIR),
    );
    newFile.path = undrived(newFile.path); // do not let the downstream see the drive
    await this.getFileList();
    this.openFile(newFile);
  }

  /**
   * Check if a file exists.
   */
  async isFileExisted(name: string) {
    const { content } = (await this.contentsManager.get(drived(USER_ROOT_DIR), {
      content: true,
      type: 'directory',
    })) as { content: IContentsModel[] } & { [key: string]: any };
    // in SecretNote there is no nested directory, so we can check by name or path
    return content.some((file) => file.name === name || file.path === name);
  }

  /**
   * Upload a notebook file.
   */
  async uploadFile(name: string, content: string) {
    await this.contentsManager.save(drived(`${USER_ROOT_DIR}${name}`), {
      type: 'notebook',
      format: 'json',
      content: JSON.parse(content),
    });
    // refresh the file list
    await this.getFileList();
  }

  /**
   * Pend a rename action.
   */
  pendRenameAction(file: IContentsModel) {
    this.pendingRename = {
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
