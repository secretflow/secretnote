import { Emitter, prop, singleton } from '@difizen/mana-app';

import { request } from '@/utils';

import type { IServer } from './protocol';
import { ServerStatus, ServerType } from './protocol';

@singleton()
export class SecretNoteServerManager {
  @prop()
  servers: IServer[] = [];

  protected readonly onServerAddedEmitter = new Emitter<IServer>();
  readonly onServerAdded = this.onServerAddedEmitter.event;
  protected readonly onServerDeletedEmitter = new Emitter<IServer>();
  readonly onServerDeleted = this.onServerDeletedEmitter.event;

  constructor() {
    this.getServerList();
  }

  async getServerList() {
    const url = 'api/nodes';
    const init = { method: 'GET' };
    const data = (await request(url, init)) as IServer[];
    for (const item of data) {
      /**
       * For historical reasons, the server id front-end uses a string
       * and the server returns an int, preserving the distinction for now
       */
      item.id = item.id.toString();
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

  async addServer(server: Partial<IServer>) {
    const newServer: IServer = {
      id: '',
      name: server.name || 'Someone',
      address: server.address || '',
      type: server.type || ServerType.common,
      status: ServerStatus.closed,
      kernelspec: undefined,
    };

    const url = 'api/nodes';
    const init = {
      method: 'POST',
      body: JSON.stringify({
        name: newServer.name,
        address: newServer.address,
        type: newServer.type,
      }),
    };
    const data = await request(url, init);

    newServer.id = data.id;

    const spec = await this.getServerSpec(newServer as IServer);
    if (spec) {
      newServer.status = ServerStatus.running;
      newServer.kernelspec = spec;
    } else {
      newServer.status = ServerStatus.error;
    }

    this.servers.push(newServer);
    this.onServerAddedEmitter.fire(newServer);
    return newServer;
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
    this.onServerAddedEmitter.fire(server);
  }

  async updateServer(id: string, server: Partial<IServer>) {
    const url = 'api/nodes/' + id;
    const init = {
      method: 'PATCH',
      body: JSON.stringify({
        name: server.name,
        address: server.address,
        type: server.type,
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

  private async getServerSpec(server: IServer) {
    const url = 'api/kernelspecs';
    try {
      const data = await request(url, {}, server.id);
      return data;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }
}
