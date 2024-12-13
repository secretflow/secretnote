import type { IContentsModel } from '@difizen/libro-jupyter';
import {
  ContentsManager,
  DocumentCommands,
  LibroModel,
  SaveFileErrorModal,
} from '@difizen/libro-jupyter';
import { CommandRegistry, inject, ModalService, transient } from '@difizen/mana-app';
import { debounce, noop } from 'lodash-es';

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
    this.onChanged(this.autoSave.bind(this));
  }

  /**
   * Serialize current notebook content to JSON and save.
   */
  async saveNotebookContent() {
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
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canRun = (..._: any) => true;
  interrupt = noop;
  shutdown = noop;
  restart = () => Promise.resolve();
  reconnect = noop;
  findRunningCell = noop;
  createCheckpoint = noop;
  listCheckpoints = noop;
  restoreCheckpoint = noop;
  deleteCheckpoint = noop;

  autoSave = debounce(() => {
    this.commandRegistry.executeCommand(DocumentCommands.Save.id);
  }, 500);
}
