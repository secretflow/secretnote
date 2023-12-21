import type { ModalItem, ModalItemProps } from '@difizen/mana-app';
import { useInject } from '@difizen/mana-app';
import { Modal, Form, Input, message, Space, Button, Select } from 'antd';
import { Plus, MinusSquare } from 'lucide-react';
import { useEffect } from 'react';

import { type DataTable, DataTableService } from './service';

const ConfigPanel = (props: ModalItemProps<DataTable>) => {
  const { visible, close, data } = props;
  const [form] = Form.useForm();
  const service = useInject<DataTableService>(DataTableService);
  const editMode = !!(data && data.tableName);

  useEffect(() => {
    if (form && data) {
      form.setFieldsValue(data);
    }
  }, [data, form]);

  const addDataTable = () => {
    form
      .validateFields()
      .then(async (values) => {
        try {
          await service.addDataTable(values);
          message.success('Add table successfully.');
          close();
        } catch (e) {
          if (e instanceof Error) {
            message.error(e.message);
          }
        }
        return;
      })
      .catch(() => {
        // pass
      });
  };

  return (
    <Modal
      open={visible}
      destroyOnClose={true}
      title="New Table"
      onOk={() => addDataTable()}
      onCancel={() => {
        close();
      }}
    >
      <Form
        form={form}
        autoComplete="off"
        requiredMark={true}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        style={{ marginTop: 24, maxHeight: 500, overflowY: 'auto' }}
        initialValues={{ dbType: 'mysql' }}
      >
        <Form.Item
          label="数据库类型"
          name="dbType"
          rules={[{ required: true, message: '请输入数据库类型' }]}
        >
          <Input maxLength={16} disabled={editMode} placeholder="mysql" />
        </Form.Item>
        <Form.Item
          label="表名称"
          name="tableName"
          rules={[{ required: true, message: '请输入表名称' }]}
        >
          <Input maxLength={16} disabled={editMode} />
        </Form.Item>
        <Form.Item
          label="关联表"
          name="refTable"
          rules={[{ required: true, message: '请输入关联表' }]}
        >
          <Input maxLength={32} disabled={editMode} />
        </Form.Item>
        <Form.Item label="数据列" className="secretnote-table-columns" required>
          <Form.List name="columns">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: 'flex', marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      rules={[{ required: true, message: '' }]}
                    >
                      <Input placeholder="Column Name" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'dtype']}
                      rules={[{ required: true, message: '' }]}
                    >
                      <Select
                        style={{ width: 140 }}
                        placeholder="Data Type"
                        options={[
                          { label: 'int', value: 'int' },
                          { label: 'string', value: 'string' },
                          { label: 'double', value: 'double' },
                        ]}
                      />
                    </Form.Item>
                    <MinusSquare
                      size={14}
                      color="#182431"
                      cursor="pointer"
                      onClick={() => remove(name)}
                    />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<Plus size={16} color="#182431" />}
                  >
                    Add Columns
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export const DataTableConfigModal: ModalItem<DataTable> = {
  id: 'data-table-config-modal',
  component: ConfigPanel,
};
