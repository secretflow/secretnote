// The modal used for creating a new table in SCQL.

import type { ModalItem, ModalItemProps } from '@difizen/mana-app';
import { useInject } from '@difizen/mana-app';
import { Modal, Form, Input, message, Space, Button, Select } from 'antd';
import { Plus, MinusSquare } from 'lucide-react';
import { useEffect } from 'react';
import { l10n } from '@difizen/mana-l10n';

import { _Table, BrokerService } from '@/modules/scql-broker';
import { genericErrorHandler } from '@/utils';
import { getProjectId } from '@/utils/scql';

const ConfigPanel = (props: ModalItemProps<_Table>) => {
  const { visible, close, data } = props;
  const [form] = Form.useForm();
  const brokerService = useInject<BrokerService>(BrokerService);
  const editMode = !!(data && data.tableName);

  useEffect(() => {
    if (form && data) {
      form.setFieldsValue(data);
    }
  }, [data, form]);

  /**
   * Handle create a new table to the project.
   */
  const handleCreateTable = async () => {
    const values = await form.validateFields();
    try {
      await brokerService.createTable(getProjectId(), values);
      message.success(l10n.t('新建数据表成功'));
      close();
    } catch (e) {
      genericErrorHandler(e);
    }
  };

  return (
    <Modal
      open={visible}
      destroyOnClose
      title={l10n.t('新建数据表')}
      onOk={() => handleCreateTable()}
      onCancel={close}
    >
      <Form
        form={form}
        autoComplete="off"
        requiredMark
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        style={{ marginTop: 24, maxHeight: 500, overflowY: 'auto' }}
        initialValues={{ dbType: 'mysql' }}
      >
        <Form.Item
          label={l10n.t('数据库类型')}
          name="dbType"
          rules={[{ required: true, message: '请输入数据库类型' }]}
        >
          <Select
            options={[
              { label: 'MySQL', value: 'mysql' },
              { label: 'Postgres', value: 'Postgres', disabled: true },
              { label: 'csvdb', value: 'csvdb', disabled: true },
            ]}
          ></Select>
        </Form.Item>
        <Form.Item
          label={l10n.t('表名称')}
          name="tableName"
          rules={[{ required: true, message: '请输入表名称' }]}
        >
          <Input maxLength={16} disabled={editMode} />
        </Form.Item>
        <Form.Item
          label={l10n.t('关联的物理表')}
          name="refTable"
          rules={[{ required: true, message: '请输入关联表' }]}
        >
          <Input maxLength={32} disabled={editMode} />
        </Form.Item>
        <Form.Item
          label={l10n.t('数据列')}
          className="secretnote-table-columns"
          required
        >
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
                      <Input placeholder={l10n.t('列名')} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'dtype']}
                      rules={[{ required: true, message: '' }]}
                    >
                      <Select
                        style={{ width: 140 }}
                        placeholder={l10n.t('数据类型')}
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
                    {l10n.t('添加列')}
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

export const TableConfigModal: ModalItem<_Table> = {
  id: 'scql-table-config-modal',
  component: ConfigPanel,
};
