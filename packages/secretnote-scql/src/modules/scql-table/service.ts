// Service for SCQL table and CCL management.

import { inject, prop, singleton } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';

import { type _Table, BrokerService } from '@/modules/scql-broker';
import { ProjectService } from '@/modules/scql-project/service';
import { genericErrorHandler } from '@/utils';
import { getProjectId } from '@/utils/scql';

@singleton()
export class TableService {
  protected readonly brokerService: BrokerService;
  protected readonly projectService: ProjectService;
  @prop() tables: _Table[] = [];

  constructor(
    @inject(BrokerService) brokerService: BrokerService,
    @inject(ProjectService) projectService: ProjectService,
  ) {
    this.brokerService = brokerService;
    this.projectService = projectService;
  }

  /**
   * Get all tables associtated with current project. Update `tables` prop in-place.
   */
  async refreshTables() {
    // Get current project.
    const project = await this.projectService.getProjectInfo(getProjectId());
    if (!project) {
      genericErrorHandler(l10n.t('当前项目无效'));
      return;
    }
    const { members } = project; // members of project
    // Get all tables of current project.
    const tables = await this.brokerService.listTables(getProjectId());
    this.tables = tables.filter(({ tableOwner }) => members.includes(tableOwner));
  }

  /**
   * Get CCL of a table.
   */
  async getTableCCL(tableName: string) {
    const project = await this.projectService.getProjectInfo(getProjectId());
    if (!project) {
      return void 0;
    }
    const table = (await this.brokerService.listTables(getProjectId(), [tableName]))[0];
    if (!table) {
      return void 0;
    }
    const ccl = await this.brokerService.showCCL(getProjectId(), [tableName]);
    if (!ccl) {
      return void 0;
    }
    return ccl;
  }
}
