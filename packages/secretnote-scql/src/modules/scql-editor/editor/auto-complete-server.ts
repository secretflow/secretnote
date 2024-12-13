/* eslint-disable @typescript-eslint/no-explicit-any */
import { l10n } from '@difizen/mana-l10n';
import * as _ from 'lodash-es';
import * as monaco from 'monaco-editor';

import { BrokerService } from '@/modules/scql-broker';
import type {
  ICompletionItem,
  ICursorInfo,
  IStatement,
  ITableInfo,
} from '@/modules/scql-editor/editor/sql-parser';
import { genericErrorHandler } from '@/utils';

type Column = {
  name: string;
  dtype: string;
};
type Table = {
  name: string;
  owner: string;
  columns: Column[];
};
type TableCCL = {
  column: string;
  [party: string]: string;
};

let getTablesPromise: Promise<Table[]> | null = null;
const getTableCCLPromiseMap: Record<string, Promise<TableCCL[]> | null> = {};

const getProjectId = () => {
  const list = location.pathname.split('/');
  return list[list.length - 1];
};

const getTables = async () => {
  if (getTablesPromise) {
    return await getTablesPromise;
  }

  getTablesPromise = new Promise((resolve, reject) => {
    BrokerService.ListTables(getProjectId(), void 0, { reThrow: true })
      .then((results) => {
        const tables = results.map((table) => ({
          name: table.tableName,
          owner: table.tableOwner,
          columns: table.columns,
        }));
        resolve(tables);
        return;
      })
      .catch(reject);
  });

  return await getTablesPromise;
};

const getTableCCL = async (tableName: string) => {
  if (getTableCCLPromiseMap[tableName]) {
    return await getTableCCLPromiseMap[tableName];
  }

  getTableCCLPromiseMap[tableName] = new Promise((resolve, reject) => {
    if (!tableName.match(/^[a-zA-Z0-9_]+$/)) {
      // avoid e.g. SELECT * crashes the application
      return resolve([]);
    }
    BrokerService.ShowCCL(getProjectId(), [tableName], void 0, { reThrow: true })
      .then((results) => {
        const ccl: TableCCL[] = [];
        results?.forEach((item) => {
          const column = item.col.column_name;
          const party = item.party_code;
          const constraint = item.constraint;

          const c = ccl.find((r) => r.column === column);
          if (c) {
            c[party] = constraint;
          } else {
            ccl.push({
              column,
              [party]: constraint,
            });
          }
        });

        resolve(ccl);
        return;
      })
      .catch((e) => {
        genericErrorHandler(e);
        resolve([]);
      });
  });

  return await getTableCCLPromiseMap[tableName];
};

const createCCLTableHtml = (ccl: TableCCL[], title: string) => {
  if (ccl.length < 1) {
    return '';
  }

  return `
  <div>
    <span>${title}</span>
    <table border="1" class="dataframe">
      <thead>
        <tr>
          ${Object.keys(ccl[0])
            .map((item) => `<th>${item}</th>`)
            .join('\n')}
        </tr>
      </thead>
      <tbody>
        ${ccl
          .map(
            (item) =>
              `<tr>
                ${Object.keys(item)
                  .map((key) => `<td>${item[key]}</td>`)
                  .join('\n')}
              </tr>`,
          )
          .join('\n')}
      </tbody>
    </table>
  </div>
  `;
};

export const onSuggestTableNames: (
  cursorInfo?: ICursorInfo<ITableInfo>,
) => Promise<ICompletionItem[]> = async () => {
  const tables = await getTables();
  return tables.map((table) => {
    return {
      label: table.name,
      insertText: table.name,
      sortText: `A${table.name}`,
      kind: monaco.languages.CompletionItemKind.Folder,
      detail: table.owner,
    };
  });
};

export const onSuggestTableFields: (
  tableInfo?: ITableInfo,
  cursorValue?: string,
  rootStatement?: IStatement,
) => Promise<ICompletionItem[]> = async (tableInfo) => {
  const tableName = _.get(tableInfo, 'tableName.value', '');
  const table = (await getTables()).find((item) => item.name === tableName);
  if (!table) {
    return [];
  }
  return table.columns.map((column) => {
    return {
      label: column.name,
      insertText: column.name,
      sortText: `B${column.name}`,
      kind: monaco.languages.CompletionItemKind.Field,
      detail: column.dtype,
    };
  });
};

export const onSuggestFunctionName: (
  inputValue?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
) => Promise<ICompletionItem[]> = (inputValue) => {
  return Promise.resolve(
    ['SUM', 'COUNT', 'AVG'].map((each) => {
      return {
        label: each,
        insertText: each,
        sortText: `C${each}`,
        kind: monaco.languages.CompletionItemKind.Function,
      };
    }),
  );
};

export const onSuggestFieldGroup: (tableNameOrAlias: string) => ICompletionItem = (
  tableNameOrAlias,
) => {
  return {
    label: tableNameOrAlias,
    insertText: tableNameOrAlias,
    sortText: `D${tableNameOrAlias}`,
    kind: monaco.languages.CompletionItemKind.Folder,
  };
};

export const onHoverTableName: (
  cursorInfo?: ICursorInfo,
) => Promise<monaco.IMarkdownString[]> = async (...args) => {
  const tableName = _.get(args, '[0].tableInfo.tableName.value', '');

  if (!tableName) {
    return [];
  }

  const ccl = await getTableCCL(tableName);

  if (!(ccl && ccl.length)) {
    return [];
  }

  return [
    {
      value: createCCLTableHtml(ccl, l10n.t('表 {0} 的 CCL', tableName)),
      supportHtml: true,
      isTrusted: true,
    },
  ];
};

export const onHoverTableField: (
  fieldName?: string,
  extra?: ICompletionItem | null,
) => Promise<monaco.IMarkdownString[]> = async (...args) => {
  if (args.length === 2) {
    const field = args[0];
    const group = args[1];
    if (field) {
      if (group === null) {
        // table name
        const ccl = await getTableCCL(field);
        if (!(ccl && ccl.length)) {
          return [];
        }
        return [
          {
            value: createCCLTableHtml(ccl, l10n.t('列 {0} 的 CCL', field)),
            supportHtml: true,
            isTrusted: true,
          },
        ];
      } else if (group && group.groupPickerName) {
        // table field
        const ccl = await getTableCCL(group.groupPickerName as any);

        if (!(ccl && ccl.length)) {
          return [];
        }

        const c = ccl.find((item) => item.column === field);
        if (!c) {
          return [];
        }
        return [
          {
            value: createCCLTableHtml([c], l10n.t('列 {0} 的 CCL', field)),
            supportHtml: true,
            isTrusted: true,
          },
        ];
      }
    }
  }

  return [];
};

export const onHoverFunctionName: (
  functionName?: string,
) => Promise<monaco.IMarkdownString[]> = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ...args
) => {
  return Promise.resolve([]);
};
