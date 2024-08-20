// Service for metrics.

import { inject, prop, singleton } from '@difizen/mana-app';
import { Poll } from '@lumino/polling';

import { SecretNoteKernelManager } from '@/modules/kernel';
import type { IServer, ServerStatus } from '@/modules/server';
import { SecretNoteServerManager } from '@/modules/server';
import { request } from '@/utils';

import { IKernelConnection } from '@difizen/libro-jupyter';
import { NotebookFileService } from '../notebook';

// The metrics information of one single server.
interface ServerMetric {
  name: string;
  status: ServerStatus;
  cpu: number; // CPU usage percentage
  memory: number; // Memory usage in bytes
  totalMemory: number; // Total memory in bytes
}

// The metrics information of all servers.
type ServerMetrics = Record<string, ServerMetric>; // server id -> server status

@singleton()
export class MetricsService {
  private _poller: Poll; // poller for metrics update

  protected readonly serverManager: SecretNoteServerManager;
  protected readonly kernelManager: SecretNoteKernelManager;
  protected readonly notebookFileService: NotebookFileService;

  @prop() metrics: ServerMetrics = {};
  @prop() enabled = false;

  constructor(
    @inject(SecretNoteServerManager) serverManager: SecretNoteServerManager,
    @inject(SecretNoteKernelManager) kernelManager: SecretNoteKernelManager,
    @inject(NotebookFileService) notebookFileService: NotebookFileService,
  ) {
    this.serverManager = serverManager;
    this.kernelManager = kernelManager;
    this.notebookFileService = notebookFileService;
    // this.notebookFileService.onNotebookFileChanged(() => {
    //   this.refresh();
    // });

    this._poller = new Poll({
      auto: false,
      factory: () => this.refresh(),
      frequency: {
        interval: 5000,
        backoff: true,
        max: 300 * 1000,
      },
      name: 'metrics',
      standby: 'when-hidden',
    });
  }

  /**
   * Enable the metrics monitor.
   */
  async enable() {
    await this.refresh(true);
    await this._poller.start();
    await this._poller.tick;
    this.enabled = true;
  }

  /**
   * Disable the metrics monitor.
   */
  async disable() {
    await this._poller.stop();
    this.enabled = false;
  }

  /**
   * Manually tick the poller.
   */
  async tick() {
    if (this.enabled) {
      await this._poller.refresh();
      await this._poller.tick;
    }
  }

  /**
   * Function on the poll to update metrics of all servers,
   * or reset the metrics to default value.
   */
  async refresh(reset = false) {
    // get current notebook file
    const currentNotebookFile = this.notebookFileService.currentNotebookFile;
    if (!currentNotebookFile) {
      return;
    }

    // get all kernel connections
    const kernelConnections =
      this.kernelManager.getKernelConnections(currentNotebookFile);

    const serverIds: string[] = [];
    kernelConnections.forEach(async (kernelConnection) => {
      // get corresponding server
      const server =
        this.kernelManager.getServerByKernelConnection(kernelConnection);
      // fetch metrics
      if (server) {
        serverIds.push(server.id);
        if (reset) {
          this.metrics[server.id] = {
            name: server.name,
            status: server.status,
            cpu: 0,
            memory: 0,
            totalMemory: 0,
          };
        } else {
          const data = await this.fetchKernelUsage(kernelConnection, server);
          this.metrics[server.id] = {
            name: server.name,
            status: server.status,
            cpu: data.cpu || 0,
            memory: data.memory || 0,
            totalMemory: data.totalMemory || 0,
          };
        }
      }
    });

    // remove unavailable servers' metrics
    for (const id in this.metrics) {
      if (!serverIds.includes(id)) {
        delete this.metrics[id];
      }
    }
  }

  /**
   * Fetch current kernel's resource usage from Jupyter Server's jupyter-resource-usage extension API.
   */
  async fetchKernelUsage(
    kernel: IKernelConnection,
    server: IServer,
  ): Promise<Partial<Pick<ServerMetric, 'cpu' | 'memory' | 'totalMemory'>>> {
    try {
      const { content } = (await request(
        `/api/metrics/v1/kernel_usage/get_usage/${kernel.id}`,
        { method: 'GET' },
        server.id,
      )) as {
        content: Partial<{
          reason: string;
          host_cpu_percent: number;
          host_virtual_memory: {
            total: number;
            used: number;
            percent: number;
          };
        }>;
      } & { [key: string]: any };

      if (content?.reason) {
        throw new Error(content.reason);
      }

      const { host_virtual_memory: vm } = content;

      return {
        cpu: content.host_cpu_percent,
        memory:
          vm?.total && vm?.percent ? (vm.total * vm.percent) / 100 : void 0,
        totalMemory: vm?.total,
      };
    } catch (e) {
      // simply skip current tick
      // eslint-disable-next-line no-console
      console.log(e);
    }
    return {};
  }
}
