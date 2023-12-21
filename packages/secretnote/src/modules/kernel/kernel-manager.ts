import type {
  IContentsModel,
  IKernelConnection,
  ISessionOptions,
  KernelConnectionOptions,
} from '@difizen/libro-jupyter';
import {
  KernelRestAPI,
  LibroKernelConnectionFactory,
  SessionRestAPI,
} from '@difizen/libro-jupyter';
import { inject, singleton, StorageService } from '@difizen/mana-app';

import { SecretNoteServerManager } from '@/modules/server';
import type { IServer } from '@/modules/server';

interface StoredSessionInfo {
  sessionId: string;
  serverId: string;
  options: {
    model: {
      id: string; // kernel.id,
      name: string; // kernel.name,
    };
  };
}

@singleton()
export class SecretNoteKernelManager {
  private file2KernelConnections = new Map<string, IKernelConnection[]>();
  private kernelConnection2Server = new Map<string, string>();

  protected sessionRestAPI: SessionRestAPI;
  protected kernelRestAPI: KernelRestAPI;
  protected kernelConnectionFactory: LibroKernelConnectionFactory;
  protected serverManager: SecretNoteServerManager;
  protected storageService: StorageService;

  constructor(
    @inject(SessionRestAPI) sessionRestAPI: SessionRestAPI,
    @inject(KernelRestAPI) kernelRestAPI: KernelRestAPI,
    @inject(SecretNoteServerManager) serverManager: SecretNoteServerManager,
    @inject(LibroKernelConnectionFactory)
    kernelConnectionFactory: LibroKernelConnectionFactory,
    @inject(StorageService) storageService: StorageService,
  ) {
    this.sessionRestAPI = sessionRestAPI;
    this.kernelRestAPI = kernelRestAPI;
    this.kernelConnectionFactory = kernelConnectionFactory;
    this.serverManager = serverManager;
    this.storageService = storageService;
  }

  async createKernelConnections(fileInfo: IContentsModel) {
    const servers = (await this.serverManager.getServerList()).filter(
      (s) => s.status === 'running',
    );
    const kernelConnections: IKernelConnection[] = [];
    const storedSessions = await this.storageService.getData<StoredSessionInfo[]>(
      this.storedKey(fileInfo),
      [],
    );

    for (let i = 0, len = servers.length; i < len; i++) {
      const s = servers[i];
      const hit = storedSessions.find((c) => c.serverId === s.id);
      let connection: IKernelConnection | undefined;
      if (hit) {
        const { options } = hit;
        const kernelId = options.model.id;
        const isAlive = await this.isKernelAlive(kernelId, s);
        if (isAlive) {
          connection = await this.connectToKernel({
            ...options,
            serverSettings: this.serverManager.getServerUrl(s),
          });
        } else {
          await this.removeStoredSession(fileInfo, hit);
          connection = await this.createKernelConnection(fileInfo, s);
        }
      } else {
        connection = await this.createKernelConnection(fileInfo, s);
      }
      if (connection) {
        kernelConnections.push(connection);
        this.kernelConnection2Server.set(connection.id, s.id);
      }
    }

    this.file2KernelConnections.set(this.storedKey(fileInfo), kernelConnections);
    return kernelConnections;
  }

  async addKernelConnectionOnServer(fileInfo: IContentsModel, server: IServer) {
    const connection = await this.createKernelConnection(fileInfo, server);
    if (connection) {
      this.kernelConnection2Server.set(connection.id, server.id);
      const existed = this.file2KernelConnections.get(this.storedKey(fileInfo)) || [];
      this.file2KernelConnections.set(this.storedKey(fileInfo), [
        ...existed,
        connection,
      ]);
    }
  }

  async deleteKernelConnectionOnServer(fileInfo: IContentsModel, server: IServer) {
    const storedSessions = await this.storageService.getData<StoredSessionInfo[]>(
      this.storedKey(fileInfo),
      [],
    );
    const hit = storedSessions.find((s) => s.serverId === server.id);
    if (hit) {
      await this.removeStoredSession(fileInfo, hit);
    }

    const kernelConnections = this.file2KernelConnections.get(this.storedKey(fileInfo));
    if (kernelConnections) {
      const deleteIds: string[] = [];
      kernelConnections.forEach((kc) => {
        const ownerServer = this.getServerByKernelConnection(kc);
        if (ownerServer && ownerServer.id === server.id) {
          this.kernelConnection2Server.delete(kc.id);
          kc.shutdown();
          deleteIds.push(kc.id);
        }
      });
      const newKernelConnections = kernelConnections.filter(
        (kc) => !deleteIds.includes(kc.id),
      );
      this.file2KernelConnections.set(this.storedKey(fileInfo), newKernelConnections);
    }
  }

  async shutdownKernelConnections(fileInfo: IContentsModel) {
    const kernelConnections = this.file2KernelConnections.get(this.storedKey(fileInfo));
    if (kernelConnections) {
      kernelConnections.forEach((kc) => {
        this.kernelConnection2Server.delete(kc.id);
        kc.shutdown();
      });
      await this.clearStoredSessions(fileInfo);
      this.file2KernelConnections.delete(this.storedKey(fileInfo));
    }
  }

  getKernelConnections(fileInfo: IContentsModel): IKernelConnection[] {
    return this.file2KernelConnections.get(this.storedKey(fileInfo)) || [];
  }

  getServerByKernelConnection(connection: IKernelConnection): IServer | undefined {
    const serverId = this.kernelConnection2Server.get(connection.id);
    if (serverId) {
      return this.serverManager.servers.find((s) => s.id === serverId);
    }
  }

  protected async createKernelConnection(
    fileInfo: IContentsModel,
    server: IServer,
  ): Promise<IKernelConnection | undefined> {
    const kernelName = this.getDefaultKernelName(fileInfo, server);
    const newSession = await this.sessionRestAPI.startSession(
      {
        name: fileInfo.name,
        kernel: {
          kernelName,
        },
        path: fileInfo.path,
        type: fileInfo.type,
      } as ISessionOptions,
      this.serverManager.getServerUrl(server),
    );

    if (!newSession || !newSession.kernel) {
      return;
    }

    const options = {
      model: {
        id: newSession.kernel.id,
        name: newSession.kernel.name,
      },
    } as KernelConnectionOptions;

    await this.addStoredSession(fileInfo, {
      sessionId: newSession.id,
      serverId: server.id,
      options,
    } as StoredSessionInfo);

    const kernelConnection = await this.connectToKernel({
      ...options,
      serverSettings: this.serverManager.getServerUrl(server),
    });

    return kernelConnection;
  }

  protected async connectToKernel(options: KernelConnectionOptions) {
    const kernelConnection = this.kernelConnectionFactory(options);
    return kernelConnection;
  }

  protected async isKernelAlive(id: string, server: IServer): Promise<boolean> {
    try {
      const data = await this.kernelRestAPI.getKernelModel(
        id,
        this.serverManager.getServerUrl(server),
      );
      return !!data;
    } catch {
      return false;
    }
  }

  protected storedKey(fileInfo: IContentsModel): string {
    return `secretnote_${fileInfo.path}_${fileInfo.name}`;
  }

  protected async addStoredSession(fileInfo: IContentsModel, info: StoredSessionInfo) {
    let sessions = await this.storageService.getData<StoredSessionInfo[]>(
      this.storedKey(fileInfo),
    );

    if (!sessions) {
      sessions = [info];
    } else {
      sessions.push(info);
    }

    await this.storageService.setData(this.storedKey(fileInfo), sessions);
  }

  protected async removeStoredSession(
    fileInfo: IContentsModel,
    info: StoredSessionInfo,
  ) {
    let sessions = await this.storageService.getData<StoredSessionInfo[]>(
      this.storedKey(fileInfo),
      [],
    );
    sessions = sessions.filter((s) => s.sessionId !== info.sessionId);
    await this.storageService.setData(this.storedKey(fileInfo), sessions);
  }

  protected async clearStoredSessions(fileInfo: IContentsModel) {
    await this.storageService.setData(this.storedKey(fileInfo), undefined);
  }

  protected getDefaultKernelName(fileInfo: IContentsModel, server: IServer): string {
    const kernelName =
      fileInfo.content.metadata.kernelspec?.name ||
      server.kernelspec?.default ||
      'python3';
    return kernelName;
  }
}
