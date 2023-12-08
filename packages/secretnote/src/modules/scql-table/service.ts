import { inject, prop, singleton } from '@difizen/mana-app';
import type { DataNode } from 'antd/es/tree';
import { history } from 'umi';

import { RequestService } from '@/modules/request';

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
  editable: boolean;
  data?: DataTable;
};

export enum Constraint {
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
  protected readonly requestService: RequestService;

  @prop()
  dataTables: DataTableNode[] = [];

  constructor(@inject(RequestService) requestService: RequestService) {
    this.requestService = requestService;
  }

  async getDataTables() {
    const treeNodes: DataTableNode[] = [];
    const { party } = await this.getPlatformInfo();
    const tables = await this.requestService.request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: 'getDataTables',
        project_id: this.getProjectId(),
      }),
    });
    if (tables) {
      if (tables.length === 0) {
        this.dataTables = [
          {
            key: party,
            title: party,
            isLeaf: false,
            editable: true,
            children: [],
          },
        ];
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tables.forEach((item: any) => {
        const node = treeNodes.find((n) => n.key === item.table_owner);
        const editable = party === item.table_owner;
        if (node) {
          if (node.children) {
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
              editable,
            });
          }
        } else {
          const newNode: DataTableNode = {
            key: item.table_owner,
            title: item.table_owner,
            isLeaf: false,
            editable,
            children: [
              {
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
                editable,
              },
            ],
          };
          treeNodes.push(newNode);
        }
      });
    }

    this.dataTables = treeNodes;
  }

  async addDataTable(table: DataTable) {
    await this.requestService.request('api/broker', {
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
    await this.requestService.request('api/broker', {
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
    const ccl = await this.requestService.request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: 'getTableCCL',
        project_id: this.getProjectId(),
        table_name: tableName,
      }),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: TableCCL[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ccl.forEach((item: any) => {
      const column = item.col.column_name;
      const party = item.party_code;
      const constraint = item.constraint;

      const c = result.find((r) => r.column === column);
      if (c) {
        c[party] = constraint;
      } else {
        result.push({
          column,
          [party]: constraint,
        });
      }
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
        if (column !== 'column') {
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

    await this.requestService.request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: 'grantCCL',
        project_id: this.getProjectId(),
        ccl_list: cclList,
      }),
    });
  }

  async getPlatformInfo() {
    const platformInfo = await this.requestService.request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: 'getPlatformInfo',
      }),
    });
    return platformInfo;
  }

  getProjectId() {
    const list = history.location.pathname.split('/');
    return list[list.length - 1];
  }
}
