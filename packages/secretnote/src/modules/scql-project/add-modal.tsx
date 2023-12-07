import type { ModalItem, ModalItemProps } from '@difizen/mana-app';
import { useInject } from '@difizen/mana-app';
import { Modal, Form, Input, message } from 'antd';
import { useEffect } from 'react';

import { type Project, ProjectService } from './service';

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
          message.success('添加成功');
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
      title="New Project"
      onOk={() => add()}
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
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: '请输入项目名称' }]}
        >
          <Input maxLength={16} disabled={editMode} />
        </Form.Item>
        <Form.Item label="Description" name="description" required={false}>
          <Input.TextArea rows={5} placeholder="请输入简短的描述" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export const ProjectConfigModal: ModalItem<Partial<Project>> = {
  id: 'project-config-modal',
  component: ConfigPanel,
};
