// Service for metrics.

import { inject, prop, singleton } from '@difizen/mana-app';
import { Poll } from '@lumino/polling';

import { SecretNoteKernelManager } from '@/modules/kernel';
import type { IServer, ServerStatus } from '@/modules/server';
import { SecretNoteServerManager } from '@/modules/server';
import { request } from '@/utils';

import { NotebookFileService } from '../notebook';

// The metrics information of one single server.
interface ServerMetric {
  name: string;
  status: ServerStatus;
  cpu: number; // CPU usage percentage
  memory: number; // Memory usage in bytes
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
    const servers = await this.serverManager.getServerList();

    servers?.forEach(async (server) => {
      if (reset) {
        this.metrics[server.id] = {
          name: server.name,
          status: server.status,
          cpu: 0,
          memory: 0,
        };
      } else {
        const data = await this.fetchServerStatus(server);
        this.metrics[server.id] = {
          name: server.name,
          status: server.status,
          cpu: data.cpu || 0,
          memory: data.memory || 0,
        };
      }
    });
  }

  /**
   * Fetch current server status from Jupyter Server's jupyter-resource-usage extension API.
   */
  async fetchServerStatus(
    server: IServer,
  ): Promise<Partial<Pick<ServerMetric, 'cpu' | 'memory'>>> {
    try {
      const data = (await request(
        '/api/metrics/v1',
        { method: 'GET' },
        server.id,
      )) as Partial<{
        rss: number; // resident set size [bytes]
        pss: number; // proportional set size [bytes]
        cpu_percent: number; // CPU usage percentage
      }>;

      return {
        cpu: data.cpu_percent,
        memory: data.pss ?? data.rss,
      };
    } catch (e) {
      // simply skip current tick
      // eslint-disable-next-line no-console
      console.error(e);
    }
    return {};
  }
}
