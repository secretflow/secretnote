// Service for SCQL table and CCL management.

import { inject, prop, singleton } from '@difizen/mana-app';
import { genericErrorHandler, request } from '@/utils';
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
    this.tables = tables.filter(({ tableOwner }) => members.includes(tableOwner));
  }

  /**
   * Get CCL of a table.
   */
  async getTableCCL(tableName: string) {
    const table = (await this.brokerService.listTables(getProjectId(), [tableName]))[0];
    if (!table) {
      return void 0;
    }
    const project = await this.projectService.getProjectInfo(tableName);
    if (!project) {
      return void 0;
    }
    const ccl = await this.brokerService.showCCL(getProjectId(), [tableName]);
    if (!ccl) {
      return void 0;
    }
    return ccl;
  }

  // async grantCCL(tableName: string, ccl: TableCCL[]) {
  //   const cclList: {
  //     col: {
  //       column_name: string;
  //       table_name: string;
  //     };
  //     party_code: string;
  //     constraint: string;
  //   }[] = [];

  //   ccl.forEach((item) => {
  //     Object.keys(item).forEach((column) => {
  //       if (column !== 'column' && item[column] !== Constraint.UNDEFINED) {
  //         cclList.push({
  //           col: {
  //             column_name: item.column,
  //             table_name: tableName,
  //           },
  //           party_code: column,
  //           constraint: item[column],
  //         });
  //       }
  //     });
  //   });

  //   await request('api/broker', {
  //     method: 'POST',
  //     body: JSON.stringify({
  //       action: 'grantCCL',
  //       project_id: getProjectId(),
  //       ccl_list: cclList,
  //     }),
  //   });
  // }
}
