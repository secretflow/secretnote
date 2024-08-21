import { inject, singleton } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';

import type { IServer } from '@/modules/server';
import { SecretNoteServerManager } from '@/modules/server';

/**
 * Definition of a remote Node serving as Jupyter Server.
 * Except those fields that Jupyter Server should have, we also have some
 * additional fields because it's running inside K8s cluster.
 */
export type Node = IServer & {
  service?: string; // service name inside K8s cluster
  podIp?: string; // pod ip address inside K8s cluster
  // versions of internals
  versions?: Partial<{
    image: string;
    python: string;
    secretflow: string;
  }>;
};

export type NodeStatusTag = 'processing' | 'default' | 'error' | 'success';

@singleton()
export class NodeService {
  protected readonly serverManager: SecretNoteServerManager;

  constructor(
    @inject(SecretNoteServerManager) serverManager: SecretNoteServerManager,
  ) {
    this.serverManager = serverManager;
  }

  /**
   * Get loading status of the server manager.
   */
  get loading() {
    return this.serverManager.loading;
  }

  /**
   * Get all remote nodes serving as Jupyter Server.
   */
  get nodes(): Node[] {
    return this.serverManager.servers.map((server) => ({
      ...server,
      versions: this.serverManager.versions,
    }));
  }

  /**
   * Check if the node name is in use.
   */
  protected isNameInUse(name: string) {
    return this.nodes.every((node) => node.name !== name);
  }

  /**
   * Add a remote node serving as Jupyter Server to under management.
   */
  async addNode({ name }: { name: string; address: string }) {
    if (this.isNameInUse(name)) {
      throw new Error(l10n.t('节点名称已存在'));
    }
    return await this.serverManager.addServer(name);
  }

  /**
   * Delete a remote node serving as Jupyter Server.
   */
  async deleteNode(id: string) {
    await this.serverManager.deleteServer(id);
  }

  /**
   * Start a remote node serving as Jupyter Server.
   */
  async startNode(id: string) {
    await this.serverManager.startServer(id);
  }

  /**
   * Stop a remote node serving as Jupyter Server.
   */
  async stopNode(id: string) {
    await this.serverManager.stopServer(id);
  }
}
