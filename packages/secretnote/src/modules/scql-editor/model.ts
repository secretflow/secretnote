import type { IContentsModel } from '@difizen/libro-jupyter';
import {
  ContentsManager,
  ExecutedWithKernelCellModel,
  LibroModel,
  SaveFileErrorModal,
  DocumentCommands,
} from '@difizen/libro-jupyter';
import { CommandRegistry, inject, ModalService, transient } from '@difizen/mana-app';
import { debounce } from 'lodash-es';

@transient()
export class SecretNoteModel extends LibroModel {
  private readonly modalService: ModalService;
  private readonly commandRegistry: CommandRegistry;

  public currentFileContents!: IContentsModel;
  public readonly contentsManager: ContentsManager;

  kernelConnection = true;
  kernelConnecting = false;
  lspEnabled = false;

  get isKernelIdle() {
    return true;
  }

  constructor(
    @inject(ContentsManager) contentsManager: ContentsManager,
    @inject(ModalService) modalService: ModalService,
    @inject(CommandRegistry) commandRegistry: CommandRegistry,
  ) {
    super();
    this.contentsManager = contentsManager;
    this.modalService = modalService;
    this.commandRegistry = commandRegistry;
    this.onSourceChanged(this.autoSave.bind(this));
  }

  async saveNotebookContent(): Promise<void> {
    const notebookContent = this.toJSON();

    if (!this.currentFileContents) {
      throw new Error('currentFileContents is undefined');
    }

    let res: IContentsModel | undefined;

    try {
      res = await this.contentsManager.save(this.currentFileContents.path, {
        type: this.currentFileContents.type,
        content: notebookContent,
        format: this.currentFileContents.format,
      });

      if (!res) {
        return;
      }

      if (
        res.last_modified === this.currentFileContents.last_modified ||
        res.size === 0
      ) {
        const errorMsg = `File Save Error: ${res?.message}`;
        this.modalService.openModal(SaveFileErrorModal);
        throw new Error(errorMsg);
      }
    } catch (e) {
      if (!res) {
        return;
      }

      this.modalService.openModal(SaveFileErrorModal);
      throw new Error('File Save Error');
    }

    await this.createCheckpoint();
  }

  canRun() {
    return true;
  }

  async interrupt() {
    // pass
  }

  async shutdown() {
    // pass
  }

  async restart() {
    // pass
  }

  async reconnect() {
    // pass
  }

  findRunningCell() {
    const runningCellIndex = this.cells.findIndex((item) => {
      if (ExecutedWithKernelCellModel.is(item.model)) {
        return item.model.kernelExecuting === true;
      }
      return false;
    });
    if (runningCellIndex > -1) {
      this.selectCell(this.cells[runningCellIndex]);
      this.scrollToView(this.cells[runningCellIndex]);
    }
  }

  async createCheckpoint() {
    if (this.currentFileContents) {
      await this.contentsManager.createCheckpoint(this.currentFileContents.path);
    }
  }

  async listCheckpoints() {
    if (this.currentFileContents) {
      await this.contentsManager.listCheckpoints(this.currentFileContents.path);
    }
  }

  async restoreCheckpoint(checkpointID: string) {
    if (this.currentFileContents) {
      await this.contentsManager.restoreCheckpoint(
        this.currentFileContents.path,
        checkpointID,
      );
    }
  }

  async deleteCheckpoint(checkpointID: string) {
    if (this.currentFileContents) {
      await this.contentsManager.deleteCheckpoint(
        this.currentFileContents.path,
        checkpointID,
      );
    }
  }

  autoSave = debounce(() => {
    this.commandRegistry.executeCommand(DocumentCommands.Save.id);
  }, 500);
}
