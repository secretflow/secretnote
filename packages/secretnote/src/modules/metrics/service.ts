import type { IKernelConnection, KernelMessage } from '@difizen/libro-jupyter';
import { kernelStatus, ServerConnection } from '@difizen/libro-jupyter';
import { getOrigin, inject, prop, singleton } from '@difizen/mana-app';
import { Poll } from '@lumino/polling';

import { SecretNoteKernelManager } from '@/modules/kernel';
import { RequestService } from '@/modules/request';
import { SecretNoteServerManager } from '@/modules/server';
import type { IServer } from '@/modules/server';

import { NotebookFileService } from '../notebook';

interface ServerStatus {
  cpu: number;
  memory: number;
  cpuText: string;
  memoryText: string;
}

interface KernelStatus {
  id: string;
  name: string;
  pid: string;
  status: KernelMessage.Status;
  statusText: string;
  statusColor: string;
  cpu: number;
  cpuText: string;
  memory: number;
  memoryText: string;
  options: string[];
}

interface MetricsItem {
  server: IServer;
  host: ServerStatus;
  kernel: KernelStatus;
}

@singleton()
export class MetricsService {
  private _pollModels: Poll;

  protected readonly serverManager: SecretNoteServerManager;
  protected readonly kernelManager: SecretNoteKernelManager;
  protected readonly serverConnection: ServerConnection;
  protected readonly notebookFileService: NotebookFileService;
  protected readonly requestService: RequestService;

  @prop()
  metrics: MetricsItem[] = [];

  @prop()
  enabled = false;

  constructor(
    @inject(SecretNoteServerManager) serverManager: SecretNoteServerManager,
    @inject(SecretNoteKernelManager) kernelManager: SecretNoteKernelManager,
    @inject(ServerConnection) serverConnection: ServerConnection,
    @inject(NotebookFileService) notebookFileService: NotebookFileService,
    @inject(RequestService) requestService: RequestService,
  ) {
    this.serverManager = serverManager;
    this.kernelManager = kernelManager;
    this.serverConnection = serverConnection;
    this.notebookFileService = notebookFileService;
    this.requestService = requestService;
    this.notebookFileService.onNotebookFileChanged(() => {
      this.refresh();
    });

    this._pollModels = new Poll({
      auto: false,
      factory: () => this.getMetrics(),
      frequency: {
        interval: 4 * 1000,
        backoff: true,
        max: 300 * 1000,
      },
      name: `metrics`,
      standby: 'when-hidden',
    });
  }

  async enable() {
    this.enabled = true;
    this.getDefaultMetrics();
    await getOrigin(this._pollModels).start();
    await getOrigin(this._pollModels).tick;
  }

  async disable() {
    this.enabled = false;
    await getOrigin(this._pollModels).stop();
  }

  async refresh() {
    if (this.enabled) {
      await getOrigin(this._pollModels).refresh();
      await getOrigin(this._pollModels).tick;
    }
  }

  getDefaultMetrics() {
    const file = this.notebookFileService.currentNotebookFile;
    const metrics: MetricsItem[] = [];

    if (file) {
      const kernelConnections = this.kernelManager.getKernelConnections(file);
      for (let i = 0, len = kernelConnections.length; i < len; i++) {
        const kernelConnection = kernelConnections[i];
        const { model, status } = kernelConnection;
        const { id, name } = model;
        const { color, text_zh } = kernelStatus[status];
        const server = this.kernelManager.getServerByKernelConnection(kernelConnection);
        if (server) {
          metrics.push({
            server: server,
            host: {
              cpu: 0,
              memory: 0,
              cpuText: 'N/A',
              memoryText: 'N/A',
            },
            kernel: {
              id,
              name,
              pid: '',
              status,
              statusText: text_zh,
              statusColor: color,
              cpu: 0,
              memory: 0,
              options: [],
              cpuText: 'N/A',
              memoryText: 'N/A',
            },
          });
        }
      }
    }
    this.metrics = metrics;
    return metrics;
  }

  async getMetrics() {
    const file = this.notebookFileService.currentNotebookFile;
    const metrics: MetricsItem[] = [];

    if (file) {
      const kernelConnections = this.kernelManager.getKernelConnections(file);
      for (let i = 0, len = kernelConnections.length; i < len; i++) {
        const metricsItem = await this.getMetricsItem(kernelConnections[i]);
        if (metricsItem) {
          metrics.push(metricsItem);
        }
      }
    }
    this.metrics = metrics;
    return metrics;
  }

  async getMetricsItem(kernelConnection: IKernelConnection) {
    const server = this.kernelManager.getServerByKernelConnection(kernelConnection);
    if (!server) {
      return;
    }
    const host = await this.getServerStatus(server);
    const kernel = await this.getKernelStatus(server, kernelConnection);
    return {
      server,
      host,
      kernel,
    };
  }

  async getServerStatus(server: IServer): Promise<ServerStatus> {
    try {
      const url = '/api/metrics/v1';
      const init = { method: 'GET' };
      const data = await this.requestService.request(url, init, server.address);

      return {
        cpu: data.cpu_percent,
        memory: data.rss,
        cpuText: `${data.cpu_percent} %`,
        memoryText: this.humanFileSize(data.rss),
      };
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
    return {
      cpu: 0,
      memory: 0,
      cpuText: 'N/A',
      memoryText: 'N/A',
    };
  }

  async getKernelStatus(
    server: IServer,
    kernelConnection: IKernelConnection,
  ): Promise<KernelStatus> {
    const { model, status } = kernelConnection;
    const { id, name } = model;
    const options = server.kernelspec ? Object.keys(server.kernelspec.kernelspecs) : [];
    try {
      const url = '/api/metrics/v1/kernel_usage/get_usage/' + id;
      const init = { method: 'GET' };
      const data = await this.requestService.request(url, init, server.address);
      const { cpu, memory, pid, cpuText, memoryText } = this.parseKernelStatus(data);
      const { color, text_zh } = kernelStatus[status];

      return {
        id,
        name,
        pid,
        status,
        statusText: text_zh,
        statusColor: color,
        cpu,
        memory,
        options,
        cpuText,
        memoryText,
      };
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
    return {
      id,
      name,
      pid: '',
      status: 'unknown',
      statusText: kernelStatus.unknown.text_zh,
      statusColor: kernelStatus.unknown.color,
      cpu: 0,
      memory: 0,
      options,
      cpuText: 'N/A',
      memoryText: 'N/A',
    };
  }

  private humanFileSize(size: number) {
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return (
      (size / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i]
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseKernelStatus(data: any) {
    const cpu = data.content.kernel_cpu;
    const memory = data.content.kernel_memory;
    const pid = data.content.pid;
    const cpuText = `${cpu} %`;
    const memoryText = this.humanFileSize(memory);
    return { cpu, memory, pid, cpuText, memoryText };
  }
}
