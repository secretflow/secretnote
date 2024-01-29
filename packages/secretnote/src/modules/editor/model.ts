import type { IContentsModel, IKernelConnection } from '@difizen/libro-jupyter';
import {
  ContentsManager,
  DocumentCommands,
  ExecutedWithKernelCellModel,
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
import { SecretNoteServerManager } from '@/modules/server';
import type { IServer } from '@/modules/server';

@transient()
export class SecretNoteModel extends LibroModel {
  private readonly kernelManager: SecretNoteKernelManager;
  private readonly serverManager: SecretNoteServerManager;
  private readonly modalService: ModalService;
  private readonly commandRegistry: CommandRegistry;

  public currentFileContents!: IContentsModel;
  public readonly contentsManager: ContentsManager;

  @prop()
  kernelConnecting = false;

  @prop()
  kernelConnections: IKernelConnection[] = [];

  @prop()
  lspEnabled = false;

  get isKernelIdle() {
    return this.kernelConnections.every((item) => {
      return item.status === 'idle';
    });
  }

  get kernelConnection() {
    return this.kernelConnections[0];
  }

  constructor(
    @inject(SecretNoteKernelManager) kernelManager: SecretNoteKernelManager,
    @inject(SecretNoteServerManager) serverManager: SecretNoteServerManager,
    @inject(ContentsManager) contentsManager: ContentsManager,
    @inject(ModalService) modalService: ModalService,
    @inject(CommandRegistry) commandRegistry: CommandRegistry,
  ) {
    super();
    this.kernelManager = kernelManager;
    this.serverManager = serverManager;
    this.contentsManager = contentsManager;
    this.modalService = modalService;
    this.commandRegistry = commandRegistry;
    this.serverManager.onServerAdded(this.onServerAdded.bind(this));
    this.serverManager.onServerDeleted(this.onServerDeleted.bind(this));
    this.onContentChanged(this.autoSave.bind(this));
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

  async interrupt() {
    await Promise.all(
      this.kernelConnections.map(async (item) => {
        await item.interrupt();
      }),
    );
  }

  async shutdown() {
    if (this.currentFileContents) {
      await this.kernelManager.shutdownKernelConnections(this.currentFileContents);
      this.kernelConnections = [];
    }
  }

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

  async reconnect() {
    await Promise.all(
      this.kernelConnections.map(async (item) => {
        await item.reconnect();
      }),
    );
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
  }, 1000);
}
