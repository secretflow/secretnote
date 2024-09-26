// The "New Project" modal.

import { Modal, Form, Input, message, Dropdown, Select } from 'antd';
import { useEffect } from 'react';
import type { ModalItem, ModalItemProps } from '@difizen/mana-app';
import { useInject } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';

import { type Project, ProjectService } from './service';
import { genericErrorHandler } from '@/utils';

const ConfigPanel = (props: ModalItemProps<Partial<Project>>) => {
  const { visible, close, data } = props;
  const [form] = Form.useForm<{
    name: string;
    description?: string;
    spu_config: string;
  }>();
  const service = useInject<ProjectService>(ProjectService);
  const editMode = !!(data && data.name);

  useEffect(() => {
    // recover values when editing
    if (form && data) {
      form.setFieldsValue(data);
    }
  }, [data, form]);

  /**
   * Add a new project.
   */
  const handleAdd = async () => {
    const values = await form.validateFields();
    try {
      await service.addProject({ ...values, id: values.name });
      message.success(l10n.t('添加成功'));
      close();
    } catch (e) {
      genericErrorHandler(e);
    }
  };

  return (
    <Modal
      open={visible}
      destroyOnClose={true}
      title={l10n.t('创建新项目')}
      okText={l10n.t('确认')}
      cancelText={l10n.t('取消')}
      onOk={() => handleAdd()}
      onCancel={() => close()}
    >
      <Form
        form={form}
        autoComplete="off"
        requiredMark={true}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        style={{ marginTop: 24 }}
        initialValues={{
          spu_config: 'SEMI2K / FM64',
        }}
      >
        <Form.Item
          label={l10n.t('项目名称')}
          name="name"
          rules={[{ required: true, message: '请输入项目名称' }]}
        >
          <Input
            maxLength={16}
            disabled={editMode}
            placeholder={l10n.t('支持英文、数字和下划线')}
            allowClear
          />
        </Form.Item>
        <Form.Item label={l10n.t('项目描述')} name="description" required={false}>
          <Input.TextArea
            rows={3}
            placeholder={l10n.t('支持英文、数字和下划线')}
            allowClear
          />
        </Form.Item>
        <Form.Item label={l10n.t('SPU 配置')} name="spu_config" required>
          <Select
            options={[
              {
                value: 'SEMI2K / FM64',
                label: 'SEMI2K / FM64',
              },
              {
                value: 'SEMI2K / FM128',
                label: 'SEMI2K / FM128',
              },
              {
                value: 'REF2K / FM64',
                label: 'REF2K / FM64',
              },
              {
                value: 'REF2K / FM128',
                label: 'REF2K / FM128',
              },
              {
                value: 'CHEETAH / FM64',
                label: 'CHEETAH / FM64',
              },
              {
                value: 'CHEETAH / FM128',
                label: 'CHEETAH / FM128',
              },
            ]}
          ></Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export const ProjectConfigModal: ModalItem<Partial<Project>> = {
  id: 'project-config-modal',
  component: ConfigPanel,
};
