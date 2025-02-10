// Services for notebook manupulation (readonly mode).
// see `src/modules/notebook/service.ts`

import type { IContentsModel, LibroView } from '@difizen/libro-jupyter';
import { Emitter, inject, prop, singleton } from '@difizen/mana-app';

import { SecretNoteConfigService } from '@/modules/config';
import { NotebookFileService } from '@/modules/notebook';
import { createNotImplemented } from '@/utils';

export const PREVIEW_NOTEBOOK_FILENAME = '__SecretNotePreview.ipynb';

@singleton()
export class PreviewNotebookFileService {
  protected readonly onNotebookFileChangedEmitter = new Emitter<{
    pre: IContentsModel | null;
    cur: IContentsModel;
  }>();
  readonly onNotebookFileChanged = this.onNotebookFileChangedEmitter.event;

  @prop() blobURL: string | undefined = undefined;
  @prop() currentNotebookFile: IContentsModel | null = null;
  @prop() currentLibroView: LibroView | null = null;

  constructor(@inject(SecretNoteConfigService) configService: SecretNoteConfigService) {
    this.blobURL = configService.getItem('blobURL');
    if (this.blobURL) {
      this.getFile(this.blobURL).then((v) => this.openFile(v));
    }
  }

  static getFileNameWithoutExt = NotebookFileService.getFileNameWithoutExt;
  static getFileNameWithExt = NotebookFileService.getFileNameWithExt;
  openFile = NotebookFileService.prototype.openFile.bind(this);
  saveFile = createNotImplemented('saveFile');
  renameFile = createNotImplemented('renameFile');
  addFile = createNotImplemented('addFile');
  deleteFile = createNotImplemented('deleteFile');
  exportFile = createNotImplemented('exportFile');
  copyFile = createNotImplemented('copyFile');
  isFileExisted = createNotImplemented('isFileExisted');
  uploadFile = createNotImplemented('uploadFile');

  async getFile(blobURL: string) {
    // TODO use makeReqeust here
    const file = await (await fetch(blobURL)).json();
    // debugger;

    return {
      name: PREVIEW_NOTEBOOK_FILENAME,
      path: blobURL,
      content: file,
    } as IContentsModel;
  }

  getFileList = () =>
    [
      {
        name: PREVIEW_NOTEBOOK_FILENAME,
        path: this.blobURL,
      },
    ] as IContentsModel[];
}
