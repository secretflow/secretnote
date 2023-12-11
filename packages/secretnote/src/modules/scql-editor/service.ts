import { inject, singleton } from '@difizen/mana-app';
import { history } from 'umi';

import { RequestService } from '@/modules/request';
import { transpose } from '@/utils';

@singleton()
export class SCQLQueryService {
  protected readonly requestService: RequestService;

  constructor(@inject(RequestService) requestService: RequestService) {
    this.requestService = requestService;
  }

  async query(query: string) {
    const data = await this.requestService.request('api/broker', {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryResult2Html(result: any[]) {
    const columns = result.map((item) => item.name);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getRowValue = (row: any) => {
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
    };
    const rows = getRowValue(result[0]).length;

    const html = `
    <div>
      <style scoped>
          .dataframe tbody tr th:only-of-type {
              vertical-align: middle;
          }

          .dataframe tbody tr th {
              vertical-align: top;
          }

          .dataframe thead th {
              text-align: right;
          }
      </style>
      <table border="1" class="dataframe">
        <thead>
          <tr style="text-align: right;">
            <th></th>
            ${columns.map((item) => `<th>${item}</th>`).join('\n')}
          </tr>
        </thead>
        <tbody>
          ${Array.from({ length: rows })
            .map((_, index) => {
              return `<tr>
              <th>${index}</th>
              ${columns
                .map((item) => {
                  const value = getRowValue(result.find((i) => i.name === item));
                  return `<td>${value[index]}</td>`;
                })
                .join('\n')}
            </tr>`;
            })
            .join('\n')}
        </tbody>
      </table>
      <p>${rows} rows × ${columns.length} columns</p>
    </div>
    `;
    return html;
  }

  getProjectId() {
    const list = history.location.pathname.split('/');
    return list[list.length - 1];
  }
}
