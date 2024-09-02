import { singleton } from '@difizen/mana-app';
import { history } from 'umi';

import { transpose, request } from '@/utils';

@singleton()
export class SCQLQueryService {
  async query(query: string) {
    const data = await request('api/broker', {
      method: 'POST',
      body: JSON.stringify({
        action: 'query',
        project_id: this.getProjectId(),
        query,
      }),
    });

    const columns: string[] = [];
    const rows: string[][] = [];

    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.forEach((item: any) => {
        columns.push(item.name);
        rows.push(this.getRowValue(item));
      });

      return {
        columns,
        rows: transpose(rows),
      };
    }

    return {
      columns,
      rows,
    };
  }

  getRowValue(row: Record<string, string[]>) {
    const keys = [
      'int32_data',
      'int64_data',
      'float_data',
      'double_data',
      'bool_data',
      'string_data',
    ];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (row[key] && row[key].length > 0) {
        return row[key];
      }
    }
    return [];
  }

  getProjectId() {
    const list = history.location.pathname.split('/');
    return list[list.length - 1];
  }
}
