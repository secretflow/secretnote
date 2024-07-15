import type { ISpecModels } from '@difizen/libro-jupyter';

export enum ServerStatus {
  Pending = 'Pending',
  Running = 'Running',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Unknown = 'Unknown',
}

export interface IServer {
  id: string;
  name: string;
  status: ServerStatus;
  kernelspec?: ISpecModels;
}
