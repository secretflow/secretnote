import { inject, singleton } from '@difizen/mana-app';

import { transpose } from '@/utils';
import { BrokerService, Tensor } from '../scql-broker';
import { getProjectId } from '@/utils/scql';

@singleton()
export class QueryService {
  protected readonly brokerService: BrokerService;

  constructor(@inject(BrokerService) brokerService: BrokerService) {
    this.brokerService = brokerService;
  }

  /**
   * Do a synchronous query and get its result immediately.
   */
  async doQuery(query: string) {
    const result = await this.brokerService.doQuery(getProjectId(), query);
    const columns: string[] = [];
    const rows: string[][] = [];

    if (result.out_columns) {
      result.out_columns.forEach((tensor) => {
        columns.push(tensor.name);
        rows.push(this.getRow(tensor).map(String));
      });
    }

    return {
      columns,
      rows: transpose(rows),
    };
  }

  getRow(row: Tensor) {
    let res;
    (
      [
        'int32_data',
        'int64_data',
        'float_data',
        'double_data',
        'bool_data',
        'string_data',
      ] as const
    ).forEach((k) => {
      if (row[k] && row[k].length) {
        res = row[k];
      }
    });
    return (res || []) as number[] | string[] | boolean[];
  }
}
