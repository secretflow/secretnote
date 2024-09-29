// The modal used for managing the CCL of a table.

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { ModalItem, ModalItemProps } from '@difizen/mana-app';
import { useInject } from '@difizen/mana-app';
import { Modal, message, Select, Table } from 'antd';
import { useState } from 'react';

import { TableService } from './service';
import { _Table, BrokerService, ColumnControl } from '../scql-broker';
import { l10n } from '@difizen/mana-l10n';

const ConfigPanel = (props: ModalItemProps<_Table>) => {
  const { visible, close, data } = props;
  const [tableCCL, setTableCCL] = useState<ColumnControl[]>([]);
  const [loading, setLoading] = useState(false);
  const brokerService = useInject<BrokerService>(BrokerService);
  const service = useInject<TableService>(TableService);
  const [tableOwner, setTableOwner] = useState('');

  /**
   * Get CCL of current table.
   */
  const handleRefreshCCL = async () => {
    try {
      setLoading(true);
      // const { ccl, owner } = await brokerService.showCCL(data!.tableName);
      // setTableOwner(owner);
      // setTableCCL(ccl);
    } catch (e) {
      if (e instanceof Error) {
        message.error(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const changeCCL = async () => {
    try {
      // await service.grantTableCCL(data!.tableName, tableCCL);
      message.success(l10n.t('成功更新 CCL'));
      close();
    } catch (e) {
      if (e instanceof Error) {
        message.error(e.message);
      }
    }
  };

  const columns =
    tableCCL.length > 0
      ? Object.keys(tableCCL[0]).map((item) => {
          if (item === 'column') {
            return {
              title: l10n.t('列'),
              dataIndex: 'column',
              key: 'column',
            };
          }
          return {
            title: `Grant to ${item === tableOwner ? item + '(you)' : item}`,
            dataIndex: item,
            key: item,
            render: (text: string, record: any) => (
              <Select
                // options={CONSTRAINT.map((c: any) => ({ label: c, value: c }))}
                value={text}
                size="small"
                style={{ width: 260 }}
                popupClassName="secret-note-ccl-select"
                onChange={(value) => {
                  const newTableCCL = tableCCL.map((c) => {
                    // if (c.column === record.column) {
                    //   return {
                    //     ...c,
                    //     [item]: value,
                    //   };
                    // }
                    return c;
                  });
                  setTableCCL(newTableCCL);
                }}
              />
            ),
          };
        })
      : [];

  return (
    <Modal
      width={720}
      open={visible}
      destroyOnClose={true}
      title="CCL Config"
      onOk={() => changeCCL()}
      onCancel={close}
      afterOpenChange={(open) => open && handleRefreshCCL()}
    >
      <a
        className="secretnote-ccl-doc-link"
        href="https://www.secretflow.org.cn/docs/scql/latest/zh-Hans/topics/ccl/intro"
        target="_blank"
        rel="noreferrer"
      >
        {l10n.t('CCL 配置说明')}
      </a>
      <Table
        className="secretnote-ccl-table"
        dataSource={tableCCL}
        rowKey="column"
        pagination={false}
        columns={columns}
        size="small"
        loading={loading}
      />
    </Modal>
  );
};

export const CCLConfigModal: ModalItem<_Table> = {
  id: 'data-table-ccl-modal',
  component: ConfigPanel,
};
