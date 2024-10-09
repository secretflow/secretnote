// The modal used for configuring the CCL of a table.

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { ModalItem, ModalItemProps } from '@difizen/mana-app';
import { useInject } from '@difizen/mana-app';
import { Modal, message, Select, Table, TableColumnsType } from 'antd';
import { useState } from 'react';

import { TableService } from './service';
import { _ColumnControlConstraint, _Table, ColumnControl } from '@/modules/scql-broker';
import { l10n } from '@difizen/mana-l10n';
import { genericErrorHandler } from '@/utils';
import { ProjectMemberService } from '../scql-member/service';
import { getProjectId } from '@/utils/scql';

const CCLModalComponent = (props: ModalItemProps<_Table>) => {
  const { visible, close, data: table } = props;
  const [loading, setLoading] = useState(false);
  const [ccl, setCCL] = useState<ColumnControl[]>([]); // native CCL of SCQL
  const [tableData, setTableData] = useState<TableItem[]>([]); // transformed CCL for Antd Table to display
  const memberService = useInject<ProjectMemberService>(ProjectMemberService);
  const tableService = useInject<TableService>(TableService);

  /**
   * Refresh CCL of current table.
   */
  const handleRefreshCCL = async () => {
    try {
      setLoading(true);
      setCCL((await tableService.getTableCCL(table!.tableName)) || []);
      setTableData(await transformCCLToTableData());
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
      // await service.grantTableCCL(data!.tableName, tableCCL);
      message.success(l10n.t('成功更新 CCL'));
      close();
    } catch (e) {
      genericErrorHandler(e);
    }
  };

  type TableItem = {
    __column: string; // name of column
    [party: string]: string; // constraint of each party
  };
  /**
   * Transform SCQL CCL to TableItem for Antd Table to display.
   */
  async function transformCCLToTableData() {
    const tableData: TableItem[] = [];
    const columns = table!.columns;
    const members = await memberService.getProjectMembers(getProjectId());
    columns.forEach((column) => {
      const item: TableItem = {
        __column: column.name,
      };
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

  const antDTableColumns: TableColumnsType = [
    {
      title: '列名',
      dataIndex: '__column',
      render(_, record) {
        return record.__column;
      },
    },
  ];

  return (
    <Modal
      width={720}
      open={visible}
      destroyOnClose={true}
      title={l10n.t('CCL 配置')}
      onOk={() => handleChangeCCL()}
      onCancel={close}
      afterOpenChange={(open) => open && handleRefreshCCL()}
    >
      <a
        className="secretnote-ccl-doc-link"
        href="https://www.secretflow.org.cn/docs/scql/latest/zh-Hans/topics/ccl/intro"
        target="_blank"
        rel="noreferrer"
      >
        {l10n.t('CCL 配置指南')}
      </a>
      <Table
        className="secretnote-ccl-table"
        dataSource={tableData}
        rowKey="column"
        pagination={false}
        columns={antdTableColumns}
        size="small"
        loading={loading}
      />
    </Modal>
  );
};

export const CCLConfigModal: ModalItem<_Table> = {
  id: 'scql-table-ccl-config-modal',
  component: CCLModalComponent,
};
