import { inject, singleton } from '@difizen/mana-app';
import { message } from 'antd';

import type { ServerStatus, ServerType } from '@/modules/server';
import { SecretNoteServerManager } from '@/modules/server';
import { randomHex } from '@/utils';

export interface Node {
  id: string;
  name: string;
  color: string;
  address: string;
  type: ServerType;
  status: ServerStatus;
}

export type ServerStatusTag = 'processing' | 'default' | 'error' | 'success';
const NODE_COLOR = randomHex();

@singleton()
export class NodeService {
  protected readonly serverManager: SecretNoteServerManager;

  constructor(@inject(SecretNoteServerManager) serverManager: SecretNoteServerManager) {
    this.serverManager = serverManager;
  }

  get nodes() {
    return this.serverManager.servers.map((server) => ({
      ...server,
      color: NODE_COLOR,
    }));
  }

  async addNode({
    name,
    address,
    type,
  }: {
    name: string;
    address: string;
    type: ServerType;
  }) {
    await this.serverManager.addServer({
      name,
      address,
      type,
    });
  }

  async deleteNode(id: string) {
    await this.serverManager.deleteServer(id);
  }

  async updateNodeName(id: string, name: string) {
    await this.serverManager.updateServer(id, { name });
  }

  protected checkName(name: string) {
    const isValid = this.nodes.every((node) => node.name !== name);
    return isValid;
  }

  protected checkAddress(address: string) {
    const isValid = this.nodes.every(
      (node) =>
        this.normalizedAddress(node.address) !== this.normalizedAddress(address),
    );

    return isValid;
  }

  protected normalizedAddress(address: string) {
    return address.replace('localhost', '127.0.0.1');
  }
}
