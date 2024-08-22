import { inject, singleton } from '@difizen/mana-app';

import type { IServer } from '@/modules/server';
import { SecretNoteServerManager } from '@/modules/server';

/**
 * Definition of a remote Node serving as Jupyter Server.
 * Except those fields that Jupyter Server should have, we also have some
 * additional fields because it's running inside K8s cluster.
 */
export type SecretNoteNode = IServer & {
  service?: string; // service name inside K8s cluster
  podIp?: string; // pod ip address inside K8s cluster
  // resources and versions of internals
  resourcesAndVersions?: Partial<{
    cpu: number;
    memory: string;
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
  get nodes(): SecretNoteNode[] {
    return this.serverManager.servers.map((server) => ({
      ...server,
      resourcesAndVersions: this.serverManager.resourcesAndVersions,
    }));
  }

  /**
   * Add a remote node serving as Jupyter Server to under management.
   */
  async addNode({ name }: { name: string; address: string }) {
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
