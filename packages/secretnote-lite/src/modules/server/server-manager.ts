import type { ISpecModels } from '@difizen/libro-jupyter';
import { ServerConnection } from '@difizen/libro-jupyter';
import { Emitter, inject, prop, singleton } from '@difizen/mana-app';

import { request, wait, getRemoteBaseUrl, getRemoteWsUrl, getInit } from '@/utils';

import type { IServer } from './protocol';
import { ServerStatus } from './protocol';

@singleton()
export class SecretNoteServerManager {
  protected readonly serverConnection: ServerConnection;

  @prop()
  servers: IServer[] = [];

  protected readonly onServerAddedEmitter = new Emitter<IServer>();
  readonly onServerAdded = this.onServerAddedEmitter.event;
  protected readonly onServerDeletedEmitter = new Emitter<IServer>();
  readonly onServerDeleted = this.onServerDeletedEmitter.event;

  constructor(@inject(ServerConnection) serverConnection: ServerConnection) {
    this.serverConnection = serverConnection;
    this.updateServerConnectionSettings();
    this.getServerList();
  }

  async getServerList() {
    const url = 'api/nodes';
    const init = { method: 'GET' };
    const data = (await request(url, init)) as IServer[];

    for (const item of data) {
      const spec = await this.getServerSpec(item);
      if (spec) {
        item.status = ServerStatus.Succeeded;
        item.kernelspec = spec;
      }
    }

    this.servers = data;
    this.updateServerConnectionSettings();
    return data;
  }

  async addServer(server: Partial<IServer>) {
    const url = 'api/nodes';
    const init = {
      method: 'POST',
      body: JSON.stringify({
        name: server.name,
      }),
    };
    const data: IServer = await request(url, init);
    const spec = await this.getServerSpec(data);

    if (spec) {
      data.status = ServerStatus.Succeeded;
      data.kernelspec = spec;
    }

    this.servers.push(data);
    this.updateServerConnectionSettings();
    this.onServerAddedEmitter.fire(data);
    return data;
  }

  async deleteServer(id: string) {
    const index = this.servers.findIndex((server) => server.id === id);
    if (index === -1) {
      return;
    }
    const url = 'api/nodes/' + id;
    const init = {
      method: 'DELETE',
    };
    await request(url, init);
    const server = this.servers[index];
    this.servers.splice(index, 1);
    this.updateServerConnectionSettings();
    this.onServerAddedEmitter.fire(server);
  }

  async updateServer(id: string, server: Partial<IServer>) {
    const url = 'api/nodes/' + id;
    const init = {
      method: 'PATCH',
      body: JSON.stringify({
        name: server.name,
      }),
    };
    await request(url, init);
    this.servers = this.servers.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          ...server,
        };
      }
      return item;
    });
  }

  async getServerDetail(id: string): Promise<IServer | undefined> {
    const url = 'api/nodes/' + id;
    const init = {
      method: 'GET',
    };
    const data = (await request(url, init)) as IServer;
    return data;
  }

  private async getServerSpec(
    server: IServer,
    retry = 3,
  ): Promise<ISpecModels | undefined> {
    const status = server.status;
    const url = 'api/kernelspecs';

    if (
      status === ServerStatus.Terminated ||
      status === ServerStatus.Failed ||
      status === ServerStatus.Unknown
    ) {
      return;
    }

    try {
      const data = await request(url, {}, server.id);
      return data;
    } catch (e) {
      if (retry > 0) {
        await wait(4000);
        return this.getServerSpec(server, retry - 1);
      }
    }
  }

  private updateServerConnectionSettings() {
    // update server connection settings
    // Resolve requests such as kernelspaces/lsp are initiated in libro
    const firstServer = this.servers[0];
    this.serverConnection.updateSettings({
      baseUrl: firstServer
        ? getRemoteBaseUrl(firstServer.id, true)
        : getRemoteBaseUrl(),
      wsUrl: firstServer ? getRemoteWsUrl(firstServer.id, true) : getRemoteWsUrl(),
      init: getInit(),
    });
  }
}
