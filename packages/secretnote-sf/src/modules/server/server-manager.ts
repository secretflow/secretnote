// Different from traditional Jupyter Server, SecretNote connects to multiple nodes,
// i.e., multiple Jupyter Servers, and the server start/stop/... operations are
// handled by the default web server instead of the Jupyter itself.
// So we need to customize the server manager to manage them.

import type { ISpecModels } from '@difizen/libro-jupyter';
import { ServerConnection, ServerManager } from '@difizen/libro-jupyter';
import { Emitter, inject, prop, singleton } from '@difizen/mana-app';

import type { SecretNoteNode } from '@/modules/node/service';
import { ServerStatus, type IServer } from '@/modules/server';
import {
  genericErrorHandler,
  getDefaultServerConnectionSettings,
  getRemoteBaseUrl,
  getRemoteWsUrl,
  request,
  wait,
} from '@/utils';

@singleton()
export class SecretNoteServerManager {
  protected readonly serverConnection: ServerConnection;
  // the server manager shipped with Libro without our customization
  // we need to use it to fire some signals
  protected readonly defaultServerManager: ServerManager;

  @prop() loading = false;
  @prop() servers: IServer[] = [];
  @prop() resourcesAndVersions: SecretNoteNode['resourcesAndVersions'] = {};

  // events and emitters
  protected readonly onServerAddedEmitter = new Emitter<IServer>();
  readonly onServerAdded = this.onServerAddedEmitter.event;
  protected readonly onServerDeletedEmitter = new Emitter<IServer>();
  readonly onServerDeleted = this.onServerDeletedEmitter.event;
  protected readonly onServerStartedEmitter = new Emitter<IServer>();
  readonly onServerStarted = this.onServerStartedEmitter.event;
  protected readonly onServerStoppedEmitter = new Emitter<IServer>();
  readonly onServerStopped = this.onServerStoppedEmitter.event;

  constructor(
    @inject(ServerConnection) serverConnection: ServerConnection,
    @inject(ServerManager) defaultServerManager: ServerManager,
  ) {
    this.serverConnection = serverConnection;
    this.defaultServerManager = defaultServerManager;
    this.updateServerConnectionSettings();
    this.getResourcesAndVersions();
    this.getServerList()
      .then((servers) => {
        // The default ServerManager must be launched to get LSP to work.
        // If there exists servers at the beginning, just launch directly.
        // Otherwise postpone the launch until a server is added.
        servers?.length &&
          !this.defaultServerManager.loaded &&
          this.defaultServerManager.launch();
        return;
      })
      .catch((e) => genericErrorHandler(e, { silent: true }));
  }

  /**
   * Refresh and get versions of server's internal softwares.
   */
  async getResourcesAndVersions() {
    return (this.resourcesAndVersions = await request<
      SecretNoteNode['resourcesAndVersions']
    >('api/resources-versions', {
      method: 'GET',
    }));
  }

  /**
   * Refresh and get the list of nodes.
   */
  async getServerList() {
    this.loading = true;
    try {
      const data = await request<SecretNoteNode[]>('api/nodes', {
        method: 'GET',
      });
      for (const item of data) {
        const spec = await this.getServerSpec(item);
        if (spec) {
          item.status = ServerStatus.Succeeded;
          item.kernelspec = spec;
        } else {
          item.status = ServerStatus.Terminated;
        }
      }
      this.servers = data;
      this.updateServerConnectionSettings();
      return data;
    } catch (e) {
      genericErrorHandler(e);
    } finally {
      this.loading = false;
    }
  }

  /*
   * Add a new remote server.
   * For self-deployed usage, podIp is required.
   */
  async addServer(name: string, podIp?: string) {
    // request to create a new server
    const data: SecretNoteNode = await request('api/nodes', {
      method: 'POST',
      body: JSON.stringify({
        name,
        ...(podIp ? { pod_ip: podIp } : {}),
      }),
    });
    // check if it's created successfully according to the kernelspecs response
    const spec = await this.getServerSpec(data);
    if (spec) {
      data.status = ServerStatus.Succeeded;
      data.kernelspec = spec;
    }
    // update the portIp if present TODO useless?
    const serverDetail = await this.getServerDetail(data.id);
    if (serverDetail) {
      data.portIp = serverDetail.portIp;
    }
    // store the server
    this.servers.push(data);
    this.updateServerConnectionSettings();
    this.onServerAddedEmitter.fire(data);
    // launch the defaultServerManager if not yet
    !this.defaultServerManager.loaded && this.defaultServerManager.launch();
    return data;
  }

  /**
   * Delete a server.
   */
  async deleteServer(id: string) {
    const index = this.servers.findIndex((server) => server.id === id);
    if (index === -1) {
      return;
    }
    await request('api/nodes/' + id, {
      method: 'DELETE',
    });
    const server = this.servers[index];
    this.servers.splice(index, 1);
    this.updateServerConnectionSettings();
    this.onServerDeletedEmitter.fire(server);
  }

  /**
   * Get details of a server.
   */
  async getServerDetail(id: string) {
    const data = await request<SecretNoteNode>(`api/nodes/${id}`, {
      method: 'GET',
    });

    return data;
  }

  /**
   * Start a server.
   */
  async startServer(id: string) {
    const server = await request<SecretNoteNode>(`api/nodes/start/${id}`, {
      method: 'PATCH',
    });

    if (server) {
      const spec = await this.getServerSpec(server);
      if (spec) {
        server.status = ServerStatus.Succeeded;
        server.kernelspec = spec;
      }

      const serverDetail = await this.getServerDetail(server.id);
      if (serverDetail) {
        server.portIp = serverDetail.portIp;
      }

      this.servers = this.servers.map((item) => {
        if (item.id === id) {
          return server;
        }
        return item;
      });
      this.updateServerConnectionSettings();
      this.onServerStartedEmitter.fire(server);
      return server;
    }
  }

  /**
   * Stop a server.
   */
  async stopServer(id: string) {
    const server: IServer = await request(`api/nodes/stop/${id}`, {
      method: 'PATCH',
    });

    if (server) {
      server.status = ServerStatus.Terminated;
      server.kernelspec = undefined;

      this.servers = this.servers.map((item) => {
        if (item.id === id) {
          return server;
        }
        return item;
      });
      this.updateServerConnectionSettings();
      this.onServerStoppedEmitter.fire(server);
    }
  }

  /**
   * Get kernelspecs of a server.
   */
  private async getServerSpec(
    server: IServer,
    retry = 10,
  ): Promise<ISpecModels | undefined> {
    if (
      [ServerStatus.Terminated, ServerStatus.Failed, ServerStatus.Unknown].includes(
        server.status,
      )
    ) {
      return;
    }

    try {
      const data = await Promise.race([
        request('api/kernelspecs', {}, server.id),
        /* eslint-disable-next-line promise/param-names */
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('timeout')), 5000);
        }),
      ]);
      return data;
    } catch (e) {
      if (retry > 0) {
        await wait(5000);
        return this.getServerSpec(server, retry - 1);
      }
    }
  }

  /**
   * Update ServerConnection's settings.
   * Settings here will affect all the rest requests inside Libro (e.g., LSP),
   * except Contents API that are taken over by SecretNoteContentsDrive,
   * and kernel management REST API that are taken over by SecretNoteKernelManager.
   */
  private updateServerConnectionSettings() {
    const firstServer = this.servers[0];
    const isFirstServerOnline =
      firstServer && firstServer.status === ServerStatus.Succeeded;
    // we only use the language server running on the first server as the representative
    if (isFirstServerOnline) {
      this.serverConnection.updateSettings({
        baseUrl: getRemoteBaseUrl(firstServer.id, true),
        wsUrl: getRemoteWsUrl(firstServer.id, true),
        ...getDefaultServerConnectionSettings(),
      });
    }
    // It's worth mentioning that libro-language-client doesn't use the ServerConnection singleton
    // to determine the URL for LSP (see `createWebSocketLanguageClient` in `libro-language-client`)
    // so the token will not be carried as query parameter in WebSocket connection URL
    // even if we set `appendToken`, causing authentication at default web server end to fail.
    // To solve this, we use a customized LanguageClientManager. See `SecretNoteLanguageClientManager`.
  }
}
