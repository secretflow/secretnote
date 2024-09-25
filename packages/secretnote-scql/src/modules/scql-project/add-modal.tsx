import type { ModalItem, ModalItemProps } from '@difizen/mana-app';
import { useInject } from '@difizen/mana-app';
import { Modal, Form, Input, message } from 'antd';
import { useEffect } from 'react';

import { type Project, ProjectService } from './service';
import { l10n } from '@difizen/mana-l10n';

const ConfigPanel = (props: ModalItemProps<Partial<Project>>) => {
  const { visible, close, data } = props;
  const [form] = Form.useForm();
  const service = useInject<ProjectService>(ProjectService);
  const editMode = !!(data && data.name);

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
          id: values.name,
          name: values.name,
          description: values.description,
        };
        try {
          await service.addProject(params);
          message.success(l10n.t('添加成功'));
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
      title={l10n.t('创建新项目')}
      okText={l10n.t('确认')}
      cancelText={l10n.t('取消')}
      onOk={() => add()}
      onCancel={() => close()}
    >
      <Form
        form={form}
        autoComplete="off"
        requiredMark={true}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        style={{ marginTop: 24 }}
      >
        <Form.Item
          label={l10n.t('项目名称')}
          name="name"
          rules={[{ required: true, message: '请输入项目名称' }]}
        >
          <Input
            maxLength={16}
            disabled={editMode}
            placeholder={l10n.t('请输入英文、数字或者下划线')}
            allowClear
          />
        </Form.Item>
        <Form.Item label={l10n.t('项目描述')} name="description" required={false}>
          <Input.TextArea
            rows={3}
            placeholder={l10n.t('请输入英文、数字或者下划线')}
            allowClear
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export const ProjectConfigModal: ModalItem<Partial<Project>> = {
  id: 'project-config-modal',
  component: ConfigPanel,
};
