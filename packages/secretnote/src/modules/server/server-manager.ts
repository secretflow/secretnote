import { ServerConnection, URL } from '@difizen/libro-jupyter';
import { Emitter, inject, prop, singleton } from '@difizen/mana-app';

import { uuid } from '@/utils';

import type { IServer } from './protocol';
import { ServerStatus } from './protocol';

@singleton()
export class SecretNoteServerManager {
  @prop()
  servers: IServer[] = [];

  protected serverConnection: ServerConnection;
  protected readonly onServerAddedEmitter = new Emitter<IServer>();
  readonly onServerAdded = this.onServerAddedEmitter.event;
  protected readonly onServerDeletedEmitter = new Emitter<IServer>();
  readonly onServerDeleted = this.onServerDeletedEmitter.event;

  constructor(@inject(ServerConnection) serverConnection: ServerConnection) {
    this.serverConnection = serverConnection;
    this.getServerList();
  }

  async getServerList() {
    const url = this.serverConnection.settings.baseUrl + 'api/nodes';
    const init = { method: 'GET' };
    try {
      const response = await this.serverConnection.makeRequest(url, init);
      if (response.status === 200) {
        const data = (await response.json()) as IServer[];
        for (const item of data) {
          const spec = await this.getServerSpec(item);
          if (spec) {
            item.status = ServerStatus.running;
            item.kernelspec = spec;
          } else {
            item.status = ServerStatus.error;
          }
        }
        this.servers = data;
        return data;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  }

  async addServer(server: Partial<IServer>) {
    const newServer = {
      id: uuid(),
      name: server.name || 'Someone',
      address: server.address || '',
      status: ServerStatus.closed,
      kernelspec: undefined,
    };
    const spec = await this.getServerSpec(newServer);
    if (spec) {
      try {
        const url = this.serverConnection.settings.baseUrl + 'api/nodes';
        const init = {
          method: 'POST',
          body: JSON.stringify({
            id: newServer.id,
            name: newServer.name,
            address: newServer.address,
          }),
        };
        const response = await this.serverConnection.makeRequest(url, init);
        if (response.status === 200) {
          newServer.status = ServerStatus.running;
          newServer.kernelspec = spec;
          this.servers.push(newServer);
          this.onServerAddedEmitter.fire(newServer);
          return newServer;
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  async deleteServer(id: string) {
    const index = this.servers.findIndex((server) => server.id === id);
    if (index === -1) {
      return;
    }
    try {
      const url = this.serverConnection.settings.baseUrl + 'api/nodes/' + id;
      const init = {
        method: 'DELETE',
      };
      const response = await this.serverConnection.makeRequest(url, init);
      if (response.status === 204) {
        const server = this.servers[index];
        this.servers.splice(index, 1);
        this.onServerAddedEmitter.fire(server);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async updateServer(id: string, server: Partial<IServer>) {
    try {
      const url = this.serverConnection.settings.baseUrl + 'api/nodes/' + id;
      const init = {
        method: 'PATCH',
        body: JSON.stringify({
          name: server.name,
          address: server.address,
        }),
      };
      const response = await this.serverConnection.makeRequest(url, init);
      if (response.status === 200) {
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
    } catch (e) {
      console.error(e);
    }
  }

  async getServerDetail(id: string): Promise<IServer | undefined> {
    try {
      const url = this.serverConnection.settings.baseUrl + 'api/nodes/' + id;
      const init = {
        method: 'GET',
      };
      const response = await this.serverConnection.makeRequest(url, init);
      if (response.status === 200) {
        const data = (await response.json()) as IServer[];
        if (data.length === 1) {
          return data[0];
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  getServerSettings(server: IServer) {
    return {
      baseUrl: `http://${server.address}/`,
      wsUrl: `ws://${server.address}/`,
    };
  }

  private async getServerSpec(server: IServer) {
    const settings = {
      ...this.serverConnection.settings,
      ...this.getServerSettings(server),
    };
    const url = URL.join(settings.baseUrl, 'api/kernelspecs');

    try {
      const response = await this.serverConnection.makeRequest(url, {}, settings);
      if (response.status === 200) {
        const data = await response.json();
        return data;
      }
    } catch (e) {
      // pass
    }
  }
}
