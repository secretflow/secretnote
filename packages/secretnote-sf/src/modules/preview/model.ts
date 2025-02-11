// Notebook model for preview mode.
// see `src/modules/editor/model.ts`

import type { IContentsModel } from '@difizen/libro-jupyter';
import { LibroModel } from '@difizen/libro-jupyter';
import { prop, transient } from '@difizen/mana-app';

import { anoop } from '@/utils';

@transient()
export class PreviewSecretNoteModel extends LibroModel {
  public currentFileContents!: IContentsModel;

  @prop() lspEnabled = false; // don't use LSP for preview

  constructor() {
    super();
    // make it readonly
    this.isEditMode =
      this.inputEditable =
      this.outputEditable =
      this.cellsEditable =
      this.savable =
      this.runnable =
      this.lspEnabled =
      this.executable =
        false;
  }

  canRun = () => false;
  startKernelConnection = anoop;
  saveNotebookContent = anoop;
  onServerAdded = anoop;
  onServerDeleted = anoop;
  interrupt = anoop;
  shutdown = anoop;
  restart = anoop;
  reconnect = anoop;
}
