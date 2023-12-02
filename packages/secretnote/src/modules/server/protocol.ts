import type { ISpecModels } from '@difizen/libro-jupyter';
import { l10n } from '@difizen/mana-l10n';

export enum ServerStatus {
  closed = 'closed',
  running = 'running',
  error = 'error',
}

export enum ServerType {
  common = 'common',
  scql = 'scql',
}

export const ServerTypeMap = {
  [ServerType.common]: l10n.t('通用'),
  [ServerType.scql]: 'SCQL',
};
export interface IServer {
  id: string;
  name: string;
  address: string;
  type: ServerType;
  status: ServerStatus;
  kernelspec?: ISpecModels;
}

export type StatusChangeAttr = Pick<IServer, 'id' | 'name' | 'status'>;
