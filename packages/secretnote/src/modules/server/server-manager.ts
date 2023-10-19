import type { ISpecModels } from '@difizen/libro-jupyter';
import { KernelSpecRestAPI, ServerConnection, URL } from '@difizen/libro-jupyter';
import {
  Deferred,
  Emitter,
  inject,
  prop,
  singleton,
  StorageService,
} from '@difizen/mana-app';

import { uuid } from '@/utils';

import type { IServer, StatusChangeAttr } from './protocol';
import { ServerStatus } from './protocol';

const host = location.host;
const defaultServer = {
  id: '1e1e72d3-844e-4ada-966e-d56bb5f217ed',
  master: true,
  name: 'Alice (You)',
  settings: { baseUrl: `http://${host}/`, wsUrl: `ws://${host}/` },
  status: ServerStatus.closed,
};

@singleton()
export class SecretNoteServerManager {
  @prop()
  servers: IServer[] = [];

  protected kernelSpecRestAPI: KernelSpecRestAPI;
  protected storageService: StorageService;
  protected serverConnection: ServerConnection;

  protected readonly onServerAddedEmitter = new Emitter<IServer>();
  readonly onServerAdded = this.onServerAddedEmitter.event;
  protected readonly onServerDeletedEmitter = new Emitter<IServer>();
  readonly onServerDeleted = this.onServerDeletedEmitter.event;
  protected readonly onServerChangedEmitter = new Emitter<{
    pre: StatusChangeAttr;
    cur: StatusChangeAttr;
  }>();
  readonly onServerChanged = this.onServerChangedEmitter.event;

  get ready() {
    return Promise.all(this.servers.map((s) => s.ready.promise));
  }

  constructor(
    @inject(KernelSpecRestAPI) kernelSpecRestAPI: KernelSpecRestAPI,
    @inject(StorageService) storageService: StorageService,
    @inject(ServerConnection) serverConnection: ServerConnection,
  ) {
    this.kernelSpecRestAPI = kernelSpecRestAPI;
    this.storageService = storageService;
    this.serverConnection = serverConnection;
    this.deserialize();
  }

  async startServices() {
    this.servers.forEach((s) => {
      if (s.status !== ServerStatus.running) {
        this.startService(s);
      }
    });
  }

  async addServer(server: Partial<IServer>) {
    const newServer = {
      id: uuid(),
      name: server.name || 'New Server',
      master: false,
      settings: server.settings || {},
      status: ServerStatus.closed,
      ready: new Deferred<ISpecModels>(),
    };
    const spec = await this.startService(newServer);
    if (spec) {
      this.servers.push(newServer);
      this.serialize();
      this.onServerAddedEmitter.fire(newServer);
      return newServer;
    }
  }

  async deleteServer(id: string) {
    const index = this.servers.findIndex((s) => s.id === id);
    if (index !== -1) {
      const server = this.servers.splice(index, 1);
      await this.serialize();
      this.onServerDeletedEmitter.fire(server[0]);
    }
  }

  async changeServer(id: string, server: Partial<IServer>) {
    const index = this.servers.findIndex((s) => s.id === id);
    if (index !== -1) {
      this.servers[index] = { ...this.servers[index], ...server };
      await this.serialize();
    }
  }

  getServerById(id: string): IServer | undefined {
    return this.servers.find((s) => s.id === id);
  }

  protected async startService(server: IServer) {
    const previousStatus = server.status;
    const spec = await this.getServerSpec(server);
    if (spec) {
      server.status = ServerStatus.running;
      server.kernelspec = spec;
      server.ready.resolve(spec);
    } else {
      server.status = ServerStatus.error;
      server.ready.reject();
    }
    this.onServerChangedEmitter.fire({
      pre: { id: server.id, name: server.name, status: previousStatus },
      cur: { id: server.id, name: server.name, status: server.status },
    });

    return spec;
  }

  protected async deserialize() {
    const services = await this.storageService.getData<IServer[]>('servers');
    if (services) {
      this.servers = services.map((item) => ({
        ...item,
        status: ServerStatus.closed,
        ready: new Deferred<ISpecModels>(),
      }));
    } else {
      this.servers = [{ ...defaultServer, ready: new Deferred<ISpecModels>() }];
    }
  }

  protected async serialize() {
    await this.storageService.setData(
      'servers',
      this.servers.map((s) => ({
        ...s,
        ready: undefined,
        status: ServerStatus.closed,
      })),
    );
  }

  protected async getServerSpec(server: IServer) {
    const settings = { ...this.serverConnection.settings, ...server.settings };
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
