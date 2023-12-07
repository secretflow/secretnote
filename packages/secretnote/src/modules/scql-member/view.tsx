import {
  BaseView,
  inject,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import {
  Avatar,
  Button,
  Tooltip,
  Form,
  Input,
  message,
  Popover,
  Space,
  Select,
} from 'antd';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import './index.less';
import { invert } from '@/utils';

import { MemberService } from './service';

export const MemberComponent = () => {
  const [form] = Form.useForm();
  const [addFormVisible, setAddFormVisible] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const instance = useInject<MemberView>(ViewInstance);

  const addNode = () => {
    form
      .validateFields()
      .then(async (values) => {
        setAddLoading(true);
        try {
          await instance.service.addNode(values);
          setAddFormVisible(false);
          form.resetFields();
          message.success(l10n.t('节点添加成功'));
        } catch (e) {
          if (e instanceof Error) {
            message.error(e.message);
          }
        } finally {
          setAddLoading(false);
        }
        return;
      })
      .catch(() => {
        //
      });
  };

  const addNodeFormContent = (
    <div className="secretnote-add-member">
      <Form
        form={form}
        autoComplete="off"
        requiredMark={false}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        initialValues={{ name: '', address: '', type: 'common' }}
      >
        <Form.Item
          label={l10n.t('名称')}
          name="name"
          rules={[
            { required: true, message: l10n.t('请输入名称') },
            { max: 16, message: l10n.t('名称过长') },
          ]}
        >
          <Input placeholder="Alice" />
        </Form.Item>
        <Form.Item
          label={l10n.t('地址')}
          name="address"
          rules={[
            { required: true, message: l10n.t('请输入地址') },
            { max: 100, message: l10n.t('地址过长') },
          ]}
        >
          <Input placeholder="127.0.0.1:8888" />
        </Form.Item>
        <Form.Item
          label={l10n.t('类型')}
          name="type"
          rules={[{ required: true, message: l10n.t('请选择节点类型') }]}
        >
          <Select
            options={[
              { label: l10n.t('通用'), value: 'common' },
              { label: 'SCQL', value: 'scql' },
            ]}
          />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 4, span: 20 }} style={{ marginBottom: 0 }}>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              onClick={() => {
                addNode();
              }}
              loading={addLoading}
            >
              {l10n.t('添加')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );

  return (
    <div className="secretnote-scql-member">
      <Avatar.Group>
        {instance.service.members.map((item) => (
          <Tooltip key={item.name} title={item.name}>
            <Avatar shape="square" style={{ backgroundColor: item.color }}>
              <span style={{ color: invert(item.color) }}>
                {item.name.slice(0, 1).toUpperCase()}
              </span>
            </Avatar>
          </Tooltip>
        ))}
      </Avatar.Group>
      <Popover
        content={addNodeFormContent}
        title=""
        overlayStyle={{ width: 446 }}
        trigger="click"
        placement="bottomLeft"
        open={addFormVisible}
        onOpenChange={(visible) => {
          form.resetFields();
          setAddFormVisible(visible);
        }}
        arrow={false}
      >
        <Button
          icon={<Plus size={16} />}
          className="btn"
          onClick={() => setAddFormVisible(true)}
        />
      </Popover>
    </div>
  );
};

@singleton()
@view('secretnote-scql-member-view')
export class MemberView extends BaseView {
  view = MemberComponent;
  readonly service: MemberService;

  constructor(@inject(MemberService) service: MemberService) {
    super();
    this.service = service;
  }

  onViewMount(): void {
    this.service.getMemberList();
  }
}
