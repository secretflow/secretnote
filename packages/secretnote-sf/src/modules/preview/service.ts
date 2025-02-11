// Services for notebook manupulation (preview mode).
// see `src/modules/notebook/service.ts`

import type { IContentsModel, LibroView } from '@difizen/libro-jupyter';
import { Emitter, inject, prop, singleton } from '@difizen/mana-app';

import { SecretNoteConfigService } from '@/modules/config';
import { NotebookFileService } from '@/modules/notebook';
import { createNotImplemented, genericErrorHandler, requestNoUnpack } from '@/utils';

export const PREVIEW_NOTEBOOK_FILENAME = '__SecretNotePreview.ipynb';

@singleton()
export class PreviewNotebookFileService {
  protected readonly onNotebookFileChangedEmitter = new Emitter<{
    pre: IContentsModel | null;
    cur: IContentsModel;
  }>();
  readonly onNotebookFileChanged = this.onNotebookFileChangedEmitter.event;

  @prop() fileURL: string | undefined = undefined;
  @prop() currentNotebookFile: IContentsModel | null = null;
  @prop() currentLibroView: LibroView | null = null;

  constructor(@inject(SecretNoteConfigService) configService: SecretNoteConfigService) {
    this.fileURL = configService.getItem('fileURL');
    if (this.fileURL) {
      this.getFile(this.fileURL)
        .then((v) => this.openFile(v))
        .catch(genericErrorHandler);
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

  async getFile(fileURL: string) {
    const file = await requestNoUnpack(fileURL, { method: 'GET', _external: true });

    return {
      name: PREVIEW_NOTEBOOK_FILENAME,
      path: fileURL,
      content: await file.json(),
    } as IContentsModel;
  }

  getFileList = () =>
    [
      {
        name: PREVIEW_NOTEBOOK_FILENAME,
        path: this.fileURL,
      },
    ] as IContentsModel[];
}
