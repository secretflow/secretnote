import type { ISpecModels } from '@difizen/libro-jupyter';

export enum ServerStatus {
  closed = 'closed',
  running = 'running',
  error = 'error',
}

export interface IServer {
  id: string;
  name: string;
  address: string;
  status: ServerStatus;
  kernelspec?: ISpecModels;
}

export type StatusChangeAttr = Pick<IServer, 'id' | 'name' | 'status'>;
