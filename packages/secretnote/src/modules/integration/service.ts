import type { Contribution } from '@difizen/mana-app';
import { contrib, inject, prop, singleton, StorageService } from '@difizen/mana-app';

import { ERROR_CODE } from '@/utils';

import type { Integration } from './protocol';
import { IntegrationMetaContribution } from './protocol';

@singleton()
export class IntegrationService {
  private readonly storageService: StorageService;
  private providers: Contribution.Provider<IntegrationMetaContribution>;

  @prop()
  integrations: Integration[] = [];

  constructor(
    @inject(StorageService) storageService: StorageService,
    @contrib(IntegrationMetaContribution)
    providers: Contribution.Provider<IntegrationMetaContribution>,
  ) {
    this.storageService = storageService;
    this.providers = providers;
  }

  async getIntegrations() {
    await this.deserialize();
    return this.integrations;
  }

  async addIntegration(integration: Integration) {
    if (!this.checkName(integration.name)) {
      return ERROR_CODE.INTEGRATION_ALREADY_EXISTED;
    }
    this.integrations.push(integration);
    await this.serialize();
    return ERROR_CODE.NO_ERROR;
  }

  async deleteIntegration(name: string) {
    this.integrations = this.integrations.filter((i) => i.name !== name);
    await this.serialize();
  }

  async updateIntegration(integration: Integration) {
    this.integrations = this.integrations.map((i) => {
      if (i.name === integration.name) {
        return { ...integration };
      }
      return i;
    });
    await this.serialize();
    return ERROR_CODE.NO_ERROR;
  }

  generateExecutableCode(integrationName: string, variableName: string, code: string) {
    const integration = this.integrations.find((i) => i.name === integrationName);
    if (integration) {
      const meta = this.getIntegrationMeta(integration.type);
      if (meta) {
        return meta.generateExecutableCode(integration, variableName, code);
      }
    }
    return '';
  }

  getIntegrationMeta(type: string) {
    const provider = this.providers.getContributions().find((p) => p.type === type);
    if (provider) {
      return provider;
    }
  }

  getAllIntegrationMeta() {
    return this.providers.getContributions();
  }

  protected async deserialize() {
    const integrations =
      await this.storageService.getData<Integration[]>('integrations');
    if (integrations) {
      this.integrations = integrations;
    }
  }

  protected async serialize() {
    await this.storageService.setData('integrations', this.integrations);
  }

  protected checkName(name: string) {
    const isValid = this.integrations.every((i) => i.name !== name);
    return isValid;
  }
}
