import type { ISettings, ISpecModels } from '@difizen/libro-jupyter';
import type { Deferred } from '@difizen/mana-app';

export enum ServerStatus {
  closed = 'closed',
  running = 'running',
  error = 'error',
}

export interface IServer {
  id: string;
  name: string;
  master: boolean;
  settings: Partial<ISettings>;
  status: ServerStatus;
  ready: Deferred<ISpecModels>;
  kernelspec?: ISpecModels;
}

export type StatusChangeAttr = Pick<IServer, 'id' | 'name' | 'status'>;
