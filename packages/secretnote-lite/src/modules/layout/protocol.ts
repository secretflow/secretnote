import { Syringe } from '@difizen/mana-app';

export const SideBarContribution = Syringe.defineToken('SideBarContribution');
export interface SideBarContribution {
  key: string;
  label: string;
  order: number;
  defaultOpen: boolean;
}
