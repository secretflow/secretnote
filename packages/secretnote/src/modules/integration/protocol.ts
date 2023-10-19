import type { ModalItem } from '@difizen/mana-app';
import { Syringe } from '@difizen/mana-app';

export interface Integration {
  name: string;
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attrs: Record<string, any>;
}

export const IntegrationMetaContribution = Syringe.defineToken(
  'IntegrationMetaContribution',
);
export interface IntegrationMetaContribution {
  type: string;
  label: string;
  icon: React.ReactElement;
  configPanel: ModalItem<Integration['attrs']>;

  generateExecutableCode: (
    integration: Integration,
    variable: string,
    code: string,
  ) => string;
}
