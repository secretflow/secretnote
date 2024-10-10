// Service for SCQL table and CCL management.

import { inject, prop, singleton } from '@difizen/mana-app';
import { genericErrorHandler } from '@/utils';
import { _Table, BrokerService, ColumnControl } from '../scql-broker';
import { getProjectId } from '@/utils/scql';
import { ProjectService } from '../scql-project/service';
import { l10n } from '@difizen/mana-l10n';

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
   * Get all tables associtated with current project.
   */
  async refreshTables() {
    // Get current project.
    const project = await this.projectService.getProjectInfo(getProjectId());
    if (!project) {
      genericErrorHandler(l10n.t('当前项目无效'));
      return;
    }
    const { members } = project; // members of project
    const tables = await this.brokerService.listTables(getProjectId()); // all tables
    console.log('alltables', tables);
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

  /**
   * Grant CCL to tables of current project.
   */
  async grantCCL(ccl: ColumnControl[]) {
    await this.brokerService.grantCCL(getProjectId(), ccl);
  }
}
