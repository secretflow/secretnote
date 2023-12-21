/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IContentsModel, LibroView } from '@difizen/libro-jupyter';
import { ContentsManager } from '@difizen/libro-jupyter';
import { Emitter, inject, prop, singleton } from '@difizen/mana-app';

import { downloadFileByUrl } from '@/utils';

const BASE_PATH = '/';
const FILE_EXT = '.ipynb';

@singleton()
export class NotebookFileService {
  protected readonly contentsManager: ContentsManager;
  protected readonly onNotebookFileChangedEmitter = new Emitter<{
    pre: IContentsModel | null;
    cur: IContentsModel;
  }>();
  readonly onNotebookFileChanged = this.onNotebookFileChangedEmitter.event;

  @prop()
  notebookFileList: IContentsModel[] = [];

  @prop()
  currentNotebookFile: IContentsModel | null = null;

  @prop()
  currentLibroView: LibroView | null = null;

  @prop()
  renameNotebookFile: { path: string; name: string } | null = null;

  constructor(@inject(ContentsManager) contentsManager: ContentsManager) {
    this.contentsManager = contentsManager;
  }

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

  async getFileList() {
    const list = await this.contentsManager.get(BASE_PATH);
    const notebookFileList = list.content.filter((file: any) =>
      file.name.endsWith(FILE_EXT),
    );
    this.notebookFileList = notebookFileList.sort((a: any, b: any) => {
      return a.name.localeCompare(b.name);
    });
  }

  async renameFile() {
    if (this.renameNotebookFile) {
      const { path, name } = this.renameNotebookFile;
      if (path && name) {
        const file = this.getFileByPath(path);
        if (file) {
          if (file.name !== name) {
            const newPath = path.replace(file.name, name);
            const isExisted = await this.isFileExisted(newPath);
            if (isExisted) {
              throw new Error('The notebook is already existed.');
            }
            const newFile = await this.contentsManager.rename(path, newPath);
            await this.getFileList();
            if (this.currentNotebookFile?.path === path) {
              this.currentNotebookFile = newFile;
            }
          }
        }
      }
    }
    this.renameNotebookFile = null;
  }

  async addFile() {
    const file = await this.contentsManager.newUntitled({
      path: BASE_PATH,
      type: 'notebook',
    });
    await this.getFileList();
    this.openFile(file);
    this.renameNotebookFile = this.createRenameNoteBookFile(file);
  }

  async deleteFile(file: IContentsModel) {
    await this.contentsManager.delete(file.path);
    await this.getFileList();
    if (this.currentNotebookFile?.path === file.path) {
      this.currentNotebookFile = null;
    }
  }

  async exportFile(file: IContentsModel) {
    const data = await this.contentsManager.getDownloadUrl(file.path);
    downloadFileByUrl(data, file.name);
  }

  async copyFile(file: IContentsModel) {
    const newFile = await this.contentsManager.copy(file.path, BASE_PATH);
    await this.getFileList();
    this.openFile(newFile);
  }

  async isFileExisted(path: string) {
    const list = await this.contentsManager.get(BASE_PATH);
    return list.content.some((file: any) => file.path === path);
  }

  async uploadFile(name: string, content: string) {
    const path = `${BASE_PATH}${name}`;
    await this.contentsManager.save(path, {
      type: 'notebook',
      content: JSON.parse(content),
      format: 'json',
    });
    await this.getFileList();
  }

  getFileByPath(path: string) {
    return this.notebookFileList.find((file) => file.path === path);
  }

  createRenameNoteBookFile(file: IContentsModel) {
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
