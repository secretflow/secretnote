import { prop, singleton } from '@difizen/mana-app';
import { Modal } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { history, request } from '@/utils';

export interface DataTableColumn {
  name: string;
  dtype: 'string' | 'double' | 'int';
}

export interface DataTable {
  tableName: string;
  refTable: string;
  dbType: string;
  tableOwner: string;
  columns: DataTableColumn[];
}

export type DataTableNode = DataNode & {
  children: DataTableNode[];
  belongToMe: boolean;
  data?: DataTable;
};

export enum Constraint {
  UNDEFINED = '',
  UNKNOWN = 'UNKNOWN',
  PLAINTEXT = 'PLAINTEXT',
  ENCRYPTED_ONLY = 'ENCRYPTED_ONLY',
  PLAINTEXT_AFTER_JOIN = 'PLAINTEXT_AFTER_JOIN',
  PLAINTEXT_AFTER_GROUP_BY = 'PLAINTEXT_AFTER_GROUP_BY',
  PLAINTEXT_AFTER_COMPARE = 'PLAINTEXT_AFTER_COMPARE',
  PLAINTEXT_AFTER_AGGREGATE = 'PLAINTEXT_AFTER_AGGREGATE',
}

export const CONSTRAINT = [
  Constraint.UNKNOWN,
  Constraint.PLAINTEXT,
  Constraint.ENCRYPTED_ONLY,
  Constraint.PLAINTEXT_AFTER_JOIN,
  Constraint.PLAINTEXT_AFTER_GROUP_BY,
  Constraint.PLAINTEXT_AFTER_COMPARE,
  Constraint.PLAINTEXT_AFTER_AGGREGATE,
];

export interface TableCCL {
  column: string;
  [party: string]: string;
}

@singleton()
export class DataTableService {
  @prop()
  dataTables: DataTableNode[] = [];

  async getDataTables() {
    const treeNodes: DataTableNode[] = [];

    const project = await this.getProjectInfo();
    if (!project) {
      return;
    }

    const platformInfo = await this.getPlatformInfo();
    if (!platformInfo) {
      return;
    }

    const tables = await request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: 'getDataTables',
        project_id: this.getProjectId(),
      }),
    });

    const { members } = project;
    const { party } = platformInfo;

    if (tables) {
      members.forEach((member: string) => {
        const belongToMe = party === member;
        const node: DataTableNode = {
          key: member,
          title: member,
          isLeaf: false,
          belongToMe,
          children: [],
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tables.forEach((item: any) => {
          if (item.table_owner === member) {
            node.children.push({
              key: item.table_name,
              title: item.table_name,
              isLeaf: true,
              data: {
                tableName: item.table_name,
                refTable: item.ref_table,
                dbType: item.db_type,
                tableOwner: item.table_owner,
                columns: item.columns,
              },
              children: [],
              belongToMe,
            });
          }
        });

        treeNodes.push(node);
      });
    }

    this.dataTables = treeNodes;
  }

  async addDataTable(table: DataTable) {
    await request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: 'createTable',
        project_id: this.getProjectId(),
        table_name: table.tableName,
        ref_table: table.refTable,
        db_type: table.dbType,
        columns: table.columns,
      }),
    });
    this.getDataTables();
  }

  async deleteDataTable(nodeData: DataNode) {
    if (!nodeData.isLeaf) {
      return;
    }
    await request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: 'deleteTable',
        project_id: this.getProjectId(),
        table_name: nodeData.title,
      }),
    });
    this.getDataTables();
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

  async grantTableCCL(tableName: string, ccl: TableCCL[]) {
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
        project_id: this.getProjectId(),
        ccl_list: cclList,
      }),
    });
  }

  async getPlatformInfo() {
    const platformInfo = await request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: 'getPlatformInfo',
      }),
    });
    return platformInfo;
  }

  async getProjectInfo() {
    const project = await request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: 'getProjectInfo',
        project_id: this.getProjectId(),
      }),
    });
    if (!project) {
      Modal.info({
        title: 'Info',
        content: 'You were not involved in the project.',
        okText: 'Back to project list',
        onOk: () => {
          history.push('/scql/project');
        },
      });
      return;
    }

    return project;
  }

  async getTableInfo(tableName: string) {
    const table = await request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: 'getTableInfo',
        project_id: this.getProjectId(),
        table_name: tableName,
      }),
    });

    return table;
  }

  getProjectId() {
    const list = history.location.pathname.split('/');
    return list[list.length - 1];
  }
}
