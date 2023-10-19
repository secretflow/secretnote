import { inject, prop, singleton } from '@difizen/mana-app';
import { Modal } from 'antd';

import type { StatusChangeAttr } from '@/modules/server';
import { SecretNoteServerManager, ServerStatus } from '@/modules/server';
import { ERROR_CODE, randomHex } from '@/utils';

export interface Node {
  id: string;
  name: string;
  color: string;
  address: string;
  status: ServerStatus;
  master: boolean;
}

export type ServerStatusTag = 'processing' | 'default' | 'error' | 'success';

@singleton()
export class NodeService {
  protected readonly serverManager: SecretNoteServerManager;

  @prop()
  nodes: Node[] = [];

  constructor(@inject(SecretNoteServerManager) serverManager: SecretNoteServerManager) {
    this.serverManager = serverManager;
    this.serverManager.onServerChanged(this.onNodeStatusChanged.bind(this));
    this.getNodes();
  }

  getNodes() {
    this.nodes = this.serverManager.servers.map((server) => ({
      id: server.id,
      name: server.name,
      color: randomHex(),
      address: this.parseAddress(server.settings.baseUrl || ''),
      status: server.status,
      master: server.master,
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
      settings: { ...this.formatAddress(address) },
    });

    if (newServer) {
      this.nodes.push({
        id: newServer.id,
        name: newServer.name,
        color: randomHex(),
        address: this.parseAddress(newServer.settings.baseUrl || ''),
        status: ServerStatus.running,
        master: false,
      });

      return ERROR_CODE.NO_ERROR;
    }

    return ERROR_CODE.NODE_OFFLINE;
  }

  async deleteNode(id: string) {
    await this.serverManager.deleteServer(id);
    this.nodes = this.nodes.filter((node) => node.id !== id);
  }

  async updateNodeName(id: string, name: string) {
    await this.serverManager.changeServer(id, { name });
    this.nodes = this.nodes.map((node) => {
      if (node.id === id) {
        return {
          ...node,
          name,
        };
      }
      return node;
    });
  }

  protected onNodeStatusChanged({
    pre,
    cur,
  }: {
    pre: StatusChangeAttr;
    cur: StatusChangeAttr;
  }) {
    this.nodes = this.nodes.map((node) => {
      if (node.id === cur.id) {
        return {
          ...node,
          status: cur.status || node.status,
        };
      }
      return node;
    });
    if (pre.status === ServerStatus.running && cur.status === ServerStatus.error) {
      Modal.error({
        title: 'Connection failed',
        content: `${cur.name} is offline, which will cause code running on ${cur.name} to fail directly.`,
      });
    }
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

  protected parseAddress(url: string) {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  protected formatAddress(address: string) {
    return {
      baseUrl: `http://${address}/`,
      wsUrl: `ws://${address}/`,
    };
  }
}
