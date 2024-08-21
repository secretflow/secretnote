// Different from traditional Jupyter Server, SecretNote connects to multiple nodes,
// i.e., multiple Jupyter Servers.
// So we need to customize the server manager to manage multiple servers.

import {
  genericErrorHandler,
  getDefaultConnectionSettings,
  getRemoteBaseUrl,
  getRemoteWsUrl,
  request,
  wait,
} from '@/utils';
import {
  ServerConnection,
  ServerManager,
  type ISpecModels,
} from '@difizen/libro-jupyter';
import { Emitter, inject, prop, singleton } from '@difizen/mana-app';
import type { SecretNoteNode } from '../node/service';
import { ServerStatus, type IServer } from './protocol';

@singleton()
export class SecretNoteServerManager {
  protected readonly serverConnection: ServerConnection;

  // @ts-ignore
  @inject(ServerManager) defaultServerManager: ServerManager;
  @prop() loading = false;
  @prop() versions: SecretNoteNode['versions'] = {};
  @prop() servers: IServer[] = [];

  // events and emitters
  protected readonly onServerAddedEmitter = new Emitter<IServer>();
  readonly onServerAdded = this.onServerAddedEmitter.event;
  protected readonly onServerDeletedEmitter = new Emitter<IServer>();
  readonly onServerDeleted = this.onServerDeletedEmitter.event;
  protected readonly onServerStartedEmitter = new Emitter<IServer>();
  readonly onServerStarted = this.onServerStartedEmitter.event;
  protected readonly onServerStoppedEmitter = new Emitter<IServer>();
  readonly onServerStopped = this.onServerStoppedEmitter.event;

  constructor(@inject(ServerConnection) serverConnection: ServerConnection) {
    this.serverConnection = serverConnection;
    this.updateServerConnectionSettings();
    this.getVersions();
    this.getServerList().then(() => {
      this.defaultServerManager.launch();
    });
  }

  /**
   * Refresh and get versions of server's internal softwares.
   */
  async getVersions() {
    return (this.versions = await request<SecretNoteNode['versions']>(
      'api/versions',
      {
        method: 'GET',
      },
    ));
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
   */
  async addServer(name: string) {
    // request to create a new server
    const data: SecretNoteNode = await request('api/nodes', {
      method: 'POST',
      body: JSON.stringify({
        name,
      }),
    });
    // check if it's created successfully according to the kernelspecs response
    const spec = await this.getServerSpec(data);
    if (spec) {
      data.status = ServerStatus.Succeeded;
      data.kernelspec = spec;
    }
    // TODO FIXME ?
    const serverDetail = await this.getServerDetail(data.id);
    if (serverDetail) {
      data.portIp = serverDetail.portIp;
    }
    // store the server
    this.servers.push(data);
    this.updateServerConnectionSettings();
    this.onServerAddedEmitter.fire(data);
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
    this.onServerAddedEmitter.fire(server);
  }

  /**
   * TODO FIXME Looks like it's useless?
   */
  async getServerDetail(id: string): Promise<IServer | undefined> {
    const data = (await request('api/nodes/' + id, {
      method: 'GET',
    })) as IServer;
    return data;
  }

  /**
   * Start a server.
   */
  async startServer(id: string) {
    const server: IServer = await request(`api/nodes/start/${id}`, {
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
    retry = 6,
  ): Promise<ISpecModels | undefined> {
    if (
      [
        ServerStatus.Terminated,
        ServerStatus.Failed,
        ServerStatus.Unknown,
      ].includes(server.status)
    ) {
      return;
    }

    try {
      const data = await Promise.race([
        request('api/kernelspecs', {}, server.id),
        new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(new Error('timeout'));
          }, 5000);
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

  private updateServerConnectionSettings() {
    // update server connection settings
    // Resolve requests such as kernelspecs/lsp are initiated in libro
    const firstServer = this.servers[0];
    const firstServerOnline =
      firstServer && firstServer.status === ServerStatus.Succeeded;

    // ! FIXME currently libro-language-client doesn't use the internal ServerConnection
    // to determine the request URL, so the Token will not be carried.
    this.serverConnection.updateSettings({
      baseUrl: firstServerOnline
        ? getRemoteBaseUrl(firstServer.id, true)
        : getRemoteBaseUrl(),
      wsUrl: firstServerOnline
        ? getRemoteWsUrl(firstServer.id, true)
        : getRemoteWsUrl(),
      ...getDefaultConnectionSettings(),
    });
  }
}
