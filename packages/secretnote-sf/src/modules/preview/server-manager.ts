// Different from traditional Jupyter Server, SecretNote connects to multiple nodes,
// i.e., multiple Jupyter Servers, and the server start/stop/... operations are
// handled by the default web server instead of the Jupyter itself.
// So we need to customize the server manager to manage them.

import { Emitter, prop, singleton } from '@difizen/mana-app';

import { type IServer } from '@/modules/server';
import { createNotImplemented } from '@/utils';

@singleton()
export class PreviewSecretNoteServerManager {
  @prop() loading = false;
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

  async getServerList() {
    return [];
  }
  addServer = createNotImplemented('addServer');
  deleteServer = createNotImplemented('deleteServer');
  getServerDetail = createNotImplemented('getServerDetail');
  startServer = createNotImplemented('startServer');
  stopServer = createNotImplemented('stopServer');
}
