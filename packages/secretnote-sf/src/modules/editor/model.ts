import type { IContentsModel, IKernelConnection } from '@difizen/libro-jupyter';
import {
  DocumentCommands,
  LibroModel,
  SaveFileErrorModal,
} from '@difizen/libro-jupyter';
import {
  CommandRegistry,
  inject,
  ModalService,
  prop,
  transient,
} from '@difizen/mana-app';
import { debounce } from 'lodash-es';

import { SecretNoteKernelManager } from '@/modules/kernel';
import { NotebookFileService } from '@/modules/notebook';
import type { IServer } from '@/modules/server';
import { SecretNoteServerManager } from '@/modules/server';
import { getGlobalConfig } from '../storage/local-storage-service';

@transient()
export class SecretNoteModel extends LibroModel {
  private readonly kernelManager: SecretNoteKernelManager;
  private readonly serverManager: SecretNoteServerManager;
  private readonly modalService: ModalService;
  private readonly commandRegistry: CommandRegistry;
  private readonly notebookFileService: NotebookFileService;

  public currentFileContents!: IContentsModel;

  @prop() kernelConnecting = false;
  @prop() kernelConnections: IKernelConnection[] = [];
  @prop() filePath = '';
  @prop() lspEnabled = true;

  protected readonly autoSave = debounce(() => {
    this.commandRegistry.executeCommand(DocumentCommands.Save.id);
  }, 500);

  /**
   * Check whether all kernels are idle.
   */
  get isKernelIdle() {
    return this.kernelConnections.every((item) => {
      return item.status === 'idle';
    });
  }

  /**
   * Get a representative kernel connection.
   */
  get kernelConnection() {
    return this.kernelConnections[0];
  }

  constructor(
    @inject(SecretNoteKernelManager) kernelManager: SecretNoteKernelManager,
    @inject(SecretNoteServerManager) serverManager: SecretNoteServerManager,
    @inject(ModalService) modalService: ModalService,
    @inject(CommandRegistry) commandRegistry: CommandRegistry,
    @inject(NotebookFileService) notebookFileService: NotebookFileService,
  ) {
    super();
    this.kernelManager = kernelManager;
    this.serverManager = serverManager;
    this.modalService = modalService;
    this.commandRegistry = commandRegistry;
    this.notebookFileService = notebookFileService;
    this.serverManager.onServerAdded(this.onServerAdded.bind(this));
    this.serverManager.onServerDeleted(this.onServerDeleted.bind(this));
    this.serverManager.onServerStarted(this.onServerAdded.bind(this));
    this.serverManager.onServerStopped(this.onServerDeleted.bind(this));
    this.onChanged(this.autoSave.bind(this));

    if (getGlobalConfig()?.readonly) {
      this.isEditMode =
        this.cellsEditable =
        this.inputEditable =
        this.outputEditable =
          false;
    }
  }

  async startKernelConnection() {
    this.kernelConnecting = true;
    const fileInfo = this.currentFileContents;

    if (!fileInfo) {
      return;
    }
    const connections = this.kernelManager.getKernelConnections(fileInfo);

    if (connections.length > 0) {
      this.kernelConnections = connections;
      this.kernelConnecting = false;
    } else {
      this.kernelConnections =
        await this.kernelManager.createKernelConnections(fileInfo);
      this.kernelConnecting = false;
    }
  }

  async saveNotebookContent(): Promise<void> {
    const notebookContent = this.toJSON();

    if (!this.currentFileContents) {
      throw new Error('currentFileContents is undefined');
    }

    let res: IContentsModel | undefined;

    try {
      res = await this.notebookFileService.saveFile(this.currentFileContents.path, {
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

    // checkpoint (see https://stackoverflow.com/questions/46421663/) is not supported in SecretNote
    // await this.createCheckpoint();
  }

  async onServerAdded(server: IServer) {
    if (this.currentFileContents) {
      await this.kernelManager.addKernelConnectionOnServer(
        this.currentFileContents,
        server,
      );
      this.kernelConnections = await this.kernelManager.createKernelConnections(
        this.currentFileContents,
      );
    }
  }

  async onServerDeleted(server: IServer) {
    if (this.currentFileContents) {
      await this.kernelManager.deleteKernelConnectionOnServer(
        this.currentFileContents,
        server,
      );
      this.kernelConnections = await this.kernelManager.createKernelConnections(
        this.currentFileContents,
      );
    }
  }

  canRun() {
    return true;
  }

  /**
   * Interrupt all kernels.
   */
  async interrupt() {
    await Promise.all(
      this.kernelConnections.map(async (item) => {
        await item.interrupt();
      }),
    );
  }

  /**
   * Shutdown all kernels for the current opened notebook.
   */
  async shutdown() {
    if (this.currentFileContents) {
      await this.kernelManager.shutdownKernelConnections(this.currentFileContents);
      this.kernelConnections = [];
    }
  }

  /**
   * Restart all kernels.
   */
  async restart() {
    if (this.kernelConnections.length === 0) {
      await this.startKernelConnection();
    } else {
      await Promise.all(
        this.kernelConnections.map(async (item) => {
          await item.restart();
        }),
      );
    }
  }

  /**
   * Reconnect all kernels.
   */
  async reconnect() {
    await Promise.all(
      this.kernelConnections.map(async (item) => {
        await item.reconnect();
      }),
    );
  }
}
