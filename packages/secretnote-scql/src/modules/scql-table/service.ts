// Service for SCQL table and CCL management.

import { inject, prop, singleton } from '@difizen/mana-app';
import { Modal } from 'antd';
import { genericErrorHandler, request } from '@/utils';
import { _Table, BrokerService } from '../scql-broker';
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

  async getTableCCL(tableName: string) {
    const result: {
      owner: string;
      ccl: TableCCL[];
    } = { owner: '', ccl: [] };

    const table = await this.getTableInfo(tableName);
    if (!table) {
      return result;
    }
    result.owner = table.table_owner;

    const project = await this.getProjectInfo();
    if (!project) {
      return result;
    }

    const ccl = await request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: 'getTableCCL',
        project_id: this.getProjectId(),
        table_name: tableName,
      }),
    });
    if (!ccl) {
      return result;
    }

    const { members } = project;
    table.columns.forEach((column: DataTableColumn) => {
      const item: TableCCL = {
        column: column.name,
      };
      members.forEach((member: string) => {
        item[member] = Constraint.UNDEFINED;
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ccl.forEach((c: any) => {
        const { column_name, table_name } = c.col;
        if (column_name === column.name && table_name === tableName) {
          item[c.party_code] = c.constraint;
        }
      });
      result.ccl.push(item);
    });

    return result;
  }

  async grantCCL(tableName: string, ccl: TableCCL[]) {
    const cclList: {
      col: {
        column_name: string;
        table_name: string;
      };
      party_code: string;
      constraint: string;
    }[] = [];

    ccl.forEach((item) => {
      Object.keys(item).forEach((column) => {
        if (column !== 'column' && item[column] !== Constraint.UNDEFINED) {
          cclList.push({
            col: {
              column_name: item.column,
              table_name: tableName,
            },
            party_code: column,
            constraint: item[column],
          });
        }
      });
    });

    await request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: 'grantCCL',
        project_id: getProjectId(),
        ccl_list: cclList,
      }),
    });
  }

  /**
   * Get table info by name.
   */
  async getTableInfo(tableName: string) {
    return await this.brokerService.listTables(getProjectId(), [tableName]);
  }
}
