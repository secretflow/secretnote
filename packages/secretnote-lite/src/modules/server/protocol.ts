import type { ISpecModels } from '@difizen/libro-jupyter';

export enum ServerStatus {
  Pending = 'Pending',
  Running = 'Running',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Unknown = 'Unknown',
  Terminated = 'Terminated', // not k8s status, but used in our app
}

export interface IServer {
  id: string;
  name: string;
  status: ServerStatus;
  service: string;
  portIp: string;
  kernelspec?: ISpecModels;
}
