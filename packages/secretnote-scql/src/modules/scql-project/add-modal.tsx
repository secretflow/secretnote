// The "New Project" modal.

import { Modal, Form, Input, message, Select } from 'antd';
import { useEffect } from 'react';
import type { ModalItem, ModalItemProps } from '@difizen/mana-app';
import { useInject } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { pick } from 'lodash-es';

import { genericErrorHandler } from '@/utils';
import { _SPURuntimeConfig, BrokerService } from '@/modules/scql-broker';

// SPU configuration options.
const SPUProtocolOptions = ['SEMI2K', 'REF2K', 'CHEETAH'].map((v) => ({
  value: v,
  label: v,
}));
const SPUFieldOptions = ['FM32', 'FM64', 'FM128'].map((v) => ({
  value: v,
  label: v,
}));

const ConfigModalComponent = (props: ModalItemProps<any>) => {
  const { visible, close, data } = props;
  const [form] = Form.useForm<{
    name: string;
    description: string;
    spu_protocol: _SPURuntimeConfig['protocol'];
    spu_field: _SPURuntimeConfig['field'];
  }>();
  const service = useInject<BrokerService>(BrokerService);
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
      await service.createProject({
        ...pick(values, ['name', 'description']),
        project_id: values.name,
        conf: {
          spu_runtime_cfg: {
            field: values.spu_field,
            protocol: values.spu_protocol,
          },
        },
      });
      message.success(l10n.t('添加成功'));
      close();
      service.listProjects();
    } catch (e) {
      genericErrorHandler(e);
    }
  };

  return (
    <Modal
      open={visible}
      destroyOnClose
      title={l10n.t('创建新项目')}
      okText={l10n.t('确认')}
      cancelText={l10n.t('取消')}
      onOk={() => handleAdd()}
      onCancel={() => close()}
    >
      <Form
        form={form}
        autoComplete="off"
        requiredMark
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        style={{ marginTop: 24 }}
        initialValues={{
          spu_protocol: 'SEMI2K',
          spu_field: 'FM64',
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
        <Form.Item label={l10n.t('SPU 协议')} name="spu_protocol" required>
          <Select options={SPUProtocolOptions}></Select>
        </Form.Item>
        <Form.Item label={l10n.t('SPU 环')} name="spu_field" required>
          <Select options={SPUFieldOptions}></Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export const ProjectConfigModal: ModalItem = {
  id: 'project-config-modal',
  component: ConfigModalComponent,
};
