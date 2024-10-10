// The modal used for configuring the CCL of a table.

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { ModalItem, ModalItemProps } from '@difizen/mana-app';
import { useInject } from '@difizen/mana-app';
import { Modal, message, Table, TableColumnsType, Select, Space, Flex } from 'antd';
import { useState } from 'react';

import { TableService } from './service';
import {
  _ColumnControlConstraint,
  _Table,
  BrokerService,
  ColumnControl,
} from '@/modules/scql-broker';
import { l10n } from '@difizen/mana-l10n';
import { genericErrorHandler } from '@/utils';
import { MemberService } from '@/modules/scql-member/service';

type CCLModalData = {
  table: _Table;
  mode: 'config' | 'view';
};

const CCLModalComponent = (props: ModalItemProps<CCLModalData>) => {
  const { visible, close, data } = props;
  const { table, mode } = data!;
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<TableItem[]>([]); // transformed for Antd Table to display
  const brokerService = useInject<BrokerService>(BrokerService);
  const memberService = useInject<MemberService>(MemberService);
  const tableService = useInject<TableService>(TableService);

  /**
   * Refresh CCL of current table.
   */
  const handleRefreshCCL = async () => {
    try {
      setLoading(true);
      setTableData(
        transformCCLToTableData((await tableService.getTableCCL(table!.tableName))!),
      );
    } catch (e) {
      genericErrorHandler(e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update CCL of current table.
   */
  const handleChangeCCL = async () => {
    try {
      const ccl = await transformTableDataToCCL(tableData);
      await tableService.grantCCL(ccl);
      message.success(l10n.t('成功更新 CCL'));
      close();
    } catch (e) {
      genericErrorHandler(e);
    }
  };

  type TableItem = {
    $column: string; // name of column
    [party: `${string}`]: string; // constraint of each party
  };
  /**
   * Transform SCQL CCL to TableItem for Antd Table to display.
   */
  function transformCCLToTableData(ccl: ColumnControl[]) {
    const tableData: TableItem[] = []; // transformed for Antd Table to display
    const columns = table!.columns,
      members = memberService.members;
    columns.forEach((column) => {
      const item: TableItem = {
        $column: column.name,
      };
      // initialize CC of each party
      members.forEach((member) => {
        item[member.party] = _ColumnControlConstraint.UNKNOWN;
      });
      ccl.forEach((cc) => {
        const { column_name, table_name } = cc.col;
        // assign constraint to each party
        if (table_name === table!.tableName && column_name === column.name) {
          item[cc.party_code] = cc.constraint;
        }
      });
      tableData.push(item);
    });
    return tableData;
  }

  /**
   * Transform TableItem to SCQL CCL for broker to update.
   */
  async function transformTableDataToCCL(tableData: TableItem[]) {
    // Since CCL corresponding with tableData might be just a subset of the complete CCL,
    // we copy the original CCL first and update it, instead of generating from tableData
    // directly.
    const ccl = (await tableService.getTableCCL(table!.tableName))!;
    tableData.forEach((item) => {
      const columnName = item.$column;
      // update or create for each party
      Object.keys(item).forEach((maybeParty) => {
        if (maybeParty === '$column') {
          return;
        }
        // find the corresponding CC for this (table, column, party)
        const cc = ccl.find(
          (v) =>
            v.col.table_name === table!.tableName &&
            v.col.column_name === columnName &&
            v.party_code === maybeParty,
        );
        if (cc) {
          // just update
          cc.constraint = item[maybeParty] as _ColumnControlConstraint;
        } else {
          // create a new CC
          ccl.push({
            col: {
              table_name: table!.tableName,
              column_name: columnName,
            },
            party_code: maybeParty,
            constraint: item[maybeParty] as _ColumnControlConstraint,
          });
        }
      });
    });
    return ccl;
  }

  const antdTableColumns: TableColumnsType<TableItem> = [
    {
      title: '列名',
      dataIndex: '$column',
      render(_, record) {
        return record.$column;
      },
    },
    ...memberService.members.map((member) => ({
      title:
        member.party +
        (member.party === table.tableOwner ? ` (${l10n.t('表所有人')})` : '') +
        (member.party === brokerService.platformInfo.party
          ? ` (${l10n.t('本方')})`
          : ''),
      dataIndex: member.party,
      width: '22em',
      render(_: unknown, record: TableItem) {
        return (
          <Select
            style={{ width: '100%' }}
            options={Object.values(_ColumnControlConstraint).map((v) => ({
              label: v,
              value: v,
            }))}
            value={record[member.party]}
            onChange={(value) => {
              const newRecord = { ...record, [member.party]: value };
              setTableData(
                tableData.map((v) => (v.$column === record.$column ? newRecord : v)),
              );
            }}
            disabled={mode === 'view'}
            variant={mode === 'view' ? 'borderless' : 'outlined'}
          />
        );
      },
    })),
  ];

  return (
    <Modal
      width={720}
      open={visible}
      destroyOnClose={true}
      title={mode === 'config' ? l10n.t('CCL 配置') : l10n.t('CCL 查看')}
      onOk={() => handleChangeCCL()}
      onCancel={close}
      afterOpenChange={(open) => open && handleRefreshCCL()}
      footer={(_, { OkBtn, CancelBtn }) =>
        mode === 'config' ? (
          <Space>
            <CancelBtn />
            <OkBtn />
          </Space>
        ) : (
          void 0
        )
      }
      okText={l10n.t('保存')}
      cancelText={l10n.t('取消')}
    >
      <Flex justify="space-between">
        <span className="secretnote-ccl-tablename">
          {l10n.t('表名')}: {table.tableName}
        </span>
        <a
          className="secretnote-ccl-doc-link"
          href="https://www.secretflow.org.cn/docs/scql/latest/zh-Hans/topics/ccl/intro"
          target="_blank"
          rel="noreferrer"
        >
          {l10n.t('CCL 指南')}
        </a>
      </Flex>

      <Table
        className="secretnote-ccl-table"
        dataSource={tableData}
        rowKey={(record) => record.$column}
        pagination={false}
        columns={antdTableColumns}
        size="small"
        loading={loading}
      />
    </Modal>
  );
};

export const CCLConfigModal: ModalItem<CCLModalData> = {
  id: 'scql-table-ccl-config-modal',
  component: CCLModalComponent,
};
