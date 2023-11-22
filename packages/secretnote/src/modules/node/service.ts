import { inject, singleton } from '@difizen/mana-app';

import type { ServerStatus } from '@/modules/server';
import { SecretNoteServerManager } from '@/modules/server';
import { ERROR_CODE, randomHex } from '@/utils';

export interface Node {
  id: string;
  name: string;
  color: string;
  address: string;
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

  async addNode({ name, address }: { name: string; address: string }) {
    if (!this.checkName(name)) {
      return ERROR_CODE.NODE_NAME_ALREADY_EXISTED;
    }

    if (!this.checkAddress(address)) {
      return ERROR_CODE.NODE_ADDRESS_ALREADY_EXISTED;
    }

    const newServer = await this.serverManager.addServer({
      name,
      address,
    });

    if (newServer) {
      return ERROR_CODE.NO_ERROR;
    }

    return ERROR_CODE.NODE_OFFLINE;
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
