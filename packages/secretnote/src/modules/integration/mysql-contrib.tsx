import { concatMultilineString } from '@difizen/libro-jupyter';
import type { ModalItemProps } from '@difizen/mana-app';
import { ModalContribution, singleton, useInject } from '@difizen/mana-app';
import { Form, Input, message, Modal, Space } from 'antd';
import { useEffect } from 'react';

import { ReactComponent as MySQLIcon } from '@/assets/image/mysql.svg';
import { ERROR_CODE, getErrorMessage } from '@/utils';

import type { Integration } from './protocol';
import { IntegrationMetaContribution } from './protocol';
import { IntegrationService } from './service';

const ConfigPanel = (props: ModalItemProps<Integration['attrs']>) => {
  const { visible, close, data } = props;
  const [form] = Form.useForm();
  const service = useInject<IntegrationService>(IntegrationService);
  const editMode = !!data && data.name;

  useEffect(() => {
    if (form && data) {
      form.setFieldsValue(data);
    }
  }, [data, form]);

  const add = () => {
    form
      .validateFields()
      .then(async (values) => {
        const params = {
          name: values.name,
          type: 'mysql',
          attrs: {
            hostname: values.hostname,
            port: values.port,
            username: values.username,
            password: values.password,
            database: values.database,
          },
        };
        const code = editMode
          ? await service.updateIntegration(params)
          : await service.addIntegration(params);
        if (code !== ERROR_CODE.NO_ERROR) {
          message.error(getErrorMessage(code));
        } else {
          await service.getIntegrations();
          message.success(`${editMode ? 'Update' : 'Add'} successfully.`);
          close();
        }
        return code;
      })
      .catch(() => {
        //
      });
  };

  return (
    <Modal
      className="secretnote-antd-modal"
      open={visible}
      destroyOnClose={true}
      title="Connect to MySQL"
      onOk={() => add()}
      onCancel={() => {
        close();
      }}
    >
      <Form
        form={form}
        autoComplete="off"
        requiredMark={false}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        initialValues={{ hostname: '127.0.0.1', port: '3306' }}
      >
        <Form.Item
          label="Integration name"
          name="name"
          rules={[{ required: true, message: 'Integration name is required' }]}
        >
          <Input maxLength={16} disabled={editMode} />
        </Form.Item>
        <Form.Item label="Address">
          <Space.Compact>
            <Form.Item
              name="hostname"
              noStyle
              rules={[{ required: true, message: 'Hostname is required' }]}
            >
              <Input maxLength={16} />
            </Form.Item>
            <Form.Item
              name="port"
              noStyle
              rules={[{ required: true, message: 'Port is required' }]}
            >
              <Input maxLength={8} style={{ width: '30%' }} />
            </Form.Item>
          </Space.Compact>
        </Form.Item>
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Username is required' }]}
        >
          <Input maxLength={16} />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Password is required' }]}
        >
          <Input type="password" maxLength={16} />
        </Form.Item>
        <Form.Item
          label="Database"
          name="database"
          rules={[{ required: true, message: 'Database is required' }]}
        >
          <Input placeholder="default_db" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

@singleton({ contrib: [IntegrationMetaContribution, ModalContribution] })
export class MySQLIntegration
  implements IntegrationMetaContribution, ModalContribution
{
  type = 'mysql';
  label = 'MySQL';
  icon = (<MySQLIcon />);
  configPanel = {
    id: `secretnote-${this.type}-config-panel`,
    component: ConfigPanel,
  };

  generateExecutableCode = (
    integration: Integration,
    variable: string,
    code: string,
  ) => {
    const { username, password, hostname, port, database } = integration.attrs;
    const lineCode = code.replace(/\n/g, ' ');
    const content = [
      '%reload_ext sql\n',
      `%sql mysql+pymysql://${username}:${password}@${hostname}:${port}/${database}\n`,
      `sql_execute_result = %sql ${lineCode}\n`,
      `${variable} = sql_execute_result.DataFrame()\n`,
      `${variable}`,
    ];

    return concatMultilineString(content);
  };

  registerModal() {
    return this.configPanel;
  }
}
