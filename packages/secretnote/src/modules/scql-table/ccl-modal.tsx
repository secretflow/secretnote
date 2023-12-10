import type { ModalItem, ModalItemProps } from '@difizen/mana-app';
import { useInject } from '@difizen/mana-app';
import { Modal, message, Select, Table } from 'antd';
import { useState } from 'react';

import { type DataTable, DataTableService, type TableCCL, CONSTRAINT } from './service';

const ConfigPanel = (props: ModalItemProps<DataTable>) => {
  const { visible, close, data } = props;
  const [tableCCL, setTableCCL] = useState<TableCCL[]>([]);
  const [loading, setLoading] = useState(false);
  const service = useInject<DataTableService>(DataTableService);

  const getTableCCL = async () => {
    try {
      setLoading(true);
      const ccl: TableCCL[] = await service.getTableCCL(data.tableName);
      setTableCCL(ccl);
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
      await service.grantTableCCL(data.tableName, tableCCL);
      message.success('ccl config successfully.');
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
              title: 'Column',
              dataIndex: 'column',
              key: 'column',
            };
          }
          return {
            title: `Grant to ${item}`,
            dataIndex: item,
            key: item,
            render: (text: string, record: TableCCL) => (
              <Select
                options={CONSTRAINT.map((c) => ({ label: c, value: c }))}
                value={text}
                size="small"
                style={{ width: 260 }}
                popupClassName="secret-note-ccl-select"
                onChange={(value) => {
                  const newTableCCL = tableCCL.map((c) => {
                    if (c.column === record.column) {
                      return {
                        ...c,
                        [item]: value,
                      };
                    }
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
      onCancel={() => {
        close();
      }}
      afterOpenChange={(open) => {
        if (open) {
          getTableCCL();
        }
      }}
    >
      <a
        className="secretnote-ccl-doc-link"
        href="https://www.secretflow.org.cn/docs/scql/latest/zh-Hans/topics/ccl/intro"
        target="_blank"
        rel="noreferrer"
      >
        CCL 配置指南
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

export const CCLConfigModal: ModalItem<DataTable> = {
  id: 'data-table-ccl-modal',
  component: ConfigPanel,
};
