import { inject, singleton } from '@difizen/mana-app';

import type { ServerStatus } from '@/modules/server';
import { SecretNoteServerManager } from '@/modules/server';
import { randomHex } from '@/utils';

export interface Node {
  id: string;
  name: string;
  color: string;
  status: ServerStatus;
  service?: string;
  podIp?: string;
}

export type ServerStatusTag = 'processing' | 'default' | 'error' | 'success';
const NODE_COLOR = randomHex();

@singleton()
export class NodeService {
  protected readonly serverManager: SecretNoteServerManager;

  constructor(@inject(SecretNoteServerManager) serverManager: SecretNoteServerManager) {
    this.serverManager = serverManager;
  }

  get loading() {
    return this.serverManager.loading;
  }

  get nodes() {
    return this.serverManager.servers.map((server) => ({
      ...server,
      color: NODE_COLOR,
    }));
  }

  async addNode({ name }: { name: string; address: string }) {
    return await this.serverManager.addServer({
      name: name.trim(),
    });
  }

  async deleteNode(id: string) {
    await this.serverManager.deleteServer(id);
  }

  async startNode(id: string) {
    await this.serverManager.startServer(id);
  }

  async stopNode(id: string) {
    await this.serverManager.stopServer(id);
  }

  async updateNodeName(id: string, name: string) {
    await this.serverManager.updateServer(id, { name });
  }

  protected checkName(name: string) {
    const isValid = this.nodes.every((node) => node.name !== name);
    return isValid;
  }
}
