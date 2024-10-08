// The protocol definition for the server module.

import type { ISpecModels } from '@difizen/libro-jupyter';

export enum ServerStatus {
  Pending = 'Pending',
  Running = 'Running',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Unknown = 'Unknown',
  Terminated = 'Terminated', // not K8s status, but used in our app
}

/**
 * Essentials of a Jupyter Server.
 */
export interface IServer {
  id: string;
  name: string;
  status: ServerStatus;
  // service: string;
  portIp: string;
  kernelspec?: ISpecModels;
}
