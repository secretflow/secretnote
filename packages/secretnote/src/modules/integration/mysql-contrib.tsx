import { concatMultilineString } from '@difizen/libro-jupyter';
import type { ModalItemProps } from '@difizen/mana-app';
import { ModalContribution, singleton, useInject } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { Form, Input, message, Modal, Space } from 'antd';
import { useEffect } from 'react';

import { ReactComponent as MySQLIcon } from '@/assets/image/mysql.svg';

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
        try {
          editMode
            ? await service.updateIntegration(params)
            : await service.addIntegration(params);
          await service.getIntegrations();
          if (editMode) {
            message.success('更新成功');
          } else {
            message.success('添加成功');
          }
          close();
        } catch (e) {
          if (e instanceof Error) {
            message.error(e.message);
          }
        }
        return;
      })
      .catch(() => {
        //
      });
  };

  return (
    <Modal
      open={visible}
      destroyOnClose={true}
      title={l10n.t('连接到 {name}', { name: 'MySQL' })}
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
          label={l10n.t('集成名称')}
          name="name"
          rules={[{ required: true, message: l10n.t('请输入集成名称') }]}
        >
          <Input maxLength={16} disabled={editMode} />
        </Form.Item>
        <Form.Item label={l10n.t('地址')}>
          <Space.Compact>
            <Form.Item
              name="hostname"
              noStyle
              rules={[{ required: true, message: l10n.t('请输入 IP') }]}
            >
              <Input maxLength={16} />
            </Form.Item>
            <Form.Item
              name="port"
              noStyle
              rules={[{ required: true, message: l10n.t('请输入端口') }]}
            >
              <Input maxLength={8} style={{ width: '30%' }} />
            </Form.Item>
          </Space.Compact>
        </Form.Item>
        <Form.Item
          label={l10n.t('用户名')}
          name="username"
          rules={[{ required: true, message: l10n.t('请输入用户名') }]}
        >
          <Input maxLength={16} />
        </Form.Item>
        <Form.Item
          label={l10n.t('密码')}
          name="password"
          rules={[{ required: true, message: l10n.t('请输入密码') }]}
        >
          <Input type="password" maxLength={16} />
        </Form.Item>
        <Form.Item
          label={l10n.t('数据库')}
          name="database"
          rules={[{ required: true, message: l10n.t('请输入数据库名称') }]}
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
