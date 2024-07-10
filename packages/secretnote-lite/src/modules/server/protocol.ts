import type { ISpecModels } from '@difizen/libro-jupyter';

export enum ServerStatus {
  starting = 'closed', // 服务启动中
  running = 'running', // 服务运行中
  stopping = 'stopping', // 服务停止中
  stopped = 'stopped', // 服务已停止
  error = 'error', // 服务异常
  maintenance = 'maintenance', // 维护中
}

export interface IServer {
  id: string;
  name: string;
  status: ServerStatus;
  default: boolean;
  kernelspec?: ISpecModels;
}
