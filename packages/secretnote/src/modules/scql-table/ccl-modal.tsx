import type { ModalItem, ModalItemProps } from '@difizen/mana-app';
import { useInject } from '@difizen/mana-app';
import { Modal, message, Select, Table } from 'antd';
import { useState } from 'react';

import { type DataTable, DataTableService, type TableCCL, CONSTRAINT } from './service';

const ConfigPanel = (props: ModalItemProps<DataTable>) => {
  const { visible, close, data } = props;
  const [tableCCL, setTableCCL] = useState<TableCCL[]>([]);
  const service = useInject<DataTableService>(DataTableService);

  const getTableCCL = async () => {
    const ccl: TableCCL[] = await service.getTableCCL(data.tableName);
    setTableCCL(ccl);
  };

  const changeCCL = async () => {
    try {
      await service.grantTableCCL(data.tableName, tableCCL);
      message.success('CCL config successfully.');
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
            title: item,
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
      width={680}
      open={visible}
      destroyOnClose={true}
      title="Config CCL"
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
      <Table
        className="secretnote-ccl-table"
        dataSource={tableCCL}
        rowKey="column"
        pagination={false}
        columns={columns}
        size="small"
      />
    </Modal>
  );
};

export const CCLConfigModal: ModalItem<DataTable> = {
  id: 'data-table-ccl-modal',
  component: ConfigPanel,
};
