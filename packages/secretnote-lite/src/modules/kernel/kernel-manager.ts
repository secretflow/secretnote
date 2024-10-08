// Kernel Manager manages all kernel connections.
// Different from common Jupyter Server, since SecretNote supports multiple parties executions,
// the kernel manager is customized to manage multiple kernel connections properly.

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

import type { IServer } from '@/modules/server';
import { SecretNoteServerManager, ServerStatus } from '@/modules/server';
import { getRemoteBaseUrl, getRemoteWsUrl } from '@/utils';

interface StoredSessionInfo {
  sessionId: string;
  serverId: string;
  options: {
    model: {
      id: string;
      name: string;
    };
  };
}

@singleton()
export class SecretNoteKernelManager {
  private fileToKernelConnections = new Map<string, IKernelConnection[]>(); // File's stored key -> Kernel connections
  private kernelConnectionToServer = new Map<string, string>(); // Kernel id -> Server id

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

  /**
   * Create kernel connections for the given file.
   */
  async createKernelConnections(fileInfo: IContentsModel) {
    // get available servers
    const availableServers = ((await this.serverManager.getServerList()) || []).filter(
      (s) => s.status === ServerStatus.Succeeded,
    );
    const kernelConnections: IKernelConnection[] = [];
    // get stored sessions
    const storedSessions = await this.storageService.getData<StoredSessionInfo[]>(
      this.storedKey(fileInfo),
      [],
    );

    for (let i = 0, len = availableServers.length; i < len; i++) {
      const s = availableServers[i];
      const hit = storedSessions.find((c) => c.serverId === s.id);
      let connection: IKernelConnection | undefined;
      if (hit) {
        const { options } = hit;
        const kernelId = options.model.id;
        const isAlive = await this.isKernelAlive(kernelId, s);
        if (isAlive) {
          connection = await this.connectToKernel({
            ...options,
            serverSettings: {
              baseUrl: getRemoteBaseUrl(s.id),
              wsUrl: getRemoteWsUrl(s.id),
            },
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
        this.kernelConnectionToServer.set(connection.id, s.id);
      }
    }

    this.fileToKernelConnections.set(this.storedKey(fileInfo), kernelConnections);
    return kernelConnections;
  }

  /**
   * Add a kernel connection on a server for a file.
   */
  async addKernelConnectionOnServer(fileInfo: IContentsModel, server: IServer) {
    const connection = await this.createKernelConnection(fileInfo, server);
    if (connection) {
      this.kernelConnectionToServer.set(connection.id, server.id);
      const existed = this.fileToKernelConnections.get(this.storedKey(fileInfo)) || [];
      this.fileToKernelConnections.set(this.storedKey(fileInfo), [
        ...existed,
        connection,
      ]);
    }
  }

  /**
   * Delete a kernel connection on a server for a file.
   */
  async deleteKernelConnectionOnServer(fileInfo: IContentsModel, server: IServer) {
    const storedSessions = await this.storageService.getData<StoredSessionInfo[]>(
      this.storedKey(fileInfo),
      [],
    );
    const hit = storedSessions.find((s) => s.serverId === server.id);
    if (hit) {
      await this.removeStoredSession(fileInfo, hit);
    }

    const kernelConnections = this.fileToKernelConnections.get(
      this.storedKey(fileInfo),
    );
    if (kernelConnections) {
      const deleteIds: string[] = [];
      kernelConnections.forEach((kc) => {
        const ownerServer = this.getServerByKernelConnection(kc);
        if (ownerServer && ownerServer.id === server.id) {
          this.kernelConnectionToServer.delete(kc.id);
          kc.shutdown();
          deleteIds.push(kc.id);
        }
      });
      const newKernelConnections = kernelConnections.filter(
        (kc) => !deleteIds.includes(kc.id),
      );
      this.fileToKernelConnections.set(this.storedKey(fileInfo), newKernelConnections);
    }
  }

  /**
   * Shutdown all kernel connections for a file.
   */
  async shutdownKernelConnections(fileInfo: IContentsModel) {
    const kernelConnections = this.fileToKernelConnections.get(
      this.storedKey(fileInfo),
    );
    if (kernelConnections) {
      kernelConnections.forEach((kc) => {
        this.kernelConnectionToServer.delete(kc.id);
        kc.shutdown();
      });
      await this.clearStoredSessions(fileInfo);
      this.fileToKernelConnections.delete(this.storedKey(fileInfo));
    }
  }

  /**
   * Get all kernel connections for a file.
   */
  getKernelConnections(fileInfo: IContentsModel) {
    return this.fileToKernelConnections.get(this.storedKey(fileInfo)) || [];
  }

  /**
   * Get the server that a kernel connection belongs to.
   */
  getServerByKernelConnection(connection: IKernelConnection) {
    const serverId = this.kernelConnectionToServer.get(connection.id);
    if (serverId) {
      return this.serverManager.servers.find((s) => s.id === serverId);
    }
  }

  /**
   * Create a kernel connection on a server for a file.
   */
  protected async createKernelConnection(fileInfo: IContentsModel, server: IServer) {
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
      {
        baseUrl: getRemoteBaseUrl(server.id),
        wsUrl: getRemoteWsUrl(server.id),
      },
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
      serverSettings: {
        baseUrl: getRemoteBaseUrl(server.id),
        wsUrl: getRemoteWsUrl(server.id),
      },
    });

    return kernelConnection;
  }

  protected async connectToKernel(options: KernelConnectionOptions) {
    const kernelConnection = this.kernelConnectionFactory(options);
    return kernelConnection;
  }

  /**
   * Test if a kernel is alive.
   */
  protected async isKernelAlive(kernelId: string, server: IServer) {
    try {
      const data = await this.kernelRestAPI.getKernelModel(kernelId, {
        baseUrl: getRemoteBaseUrl(server.id),
        wsUrl: getRemoteWsUrl(server.id),
      });
      return !!data;
    } catch {
      return false;
    }
  }

  /**
   * Generate a key for a file's session storage record.
   */
  protected storedKey(fileInfo: IContentsModel) {
    return `secretnote_${fileInfo.path}_${fileInfo.name}`;
  }

  /**
   * Append a stored session for a file.
   */
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

  /**
   * Clear all stored sessions for a file.
   */
  protected async clearStoredSessions(fileInfo: IContentsModel) {
    await this.storageService.setData(this.storedKey(fileInfo), undefined);
  }

  protected getDefaultKernelName(fileInfo: IContentsModel, server: IServer) {
    const kernelName =
      fileInfo.content.metadata.kernelspec?.name ||
      server.kernelspec?.default ||
      'python3';
    return kernelName;
  }
}
