import {
  BaseView,
  inject,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { Avatar, Button, Tooltip, Form, Input, message, Popover, Space } from 'antd';
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
  const formValues = Form.useWatch([], form);

  const addMember = () => {
    form
      .validateFields()
      .then(async (values) => {
        setAddLoading(true);
        try {
          await instance.service.inviteMember(values.name);
          setAddFormVisible(false);
          form.resetFields();
          message.success('Invitations have been sent out.');
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
        style={{ display: 'flex' }}
      >
        <Form.Item
          label=""
          name="name"
          rules={[
            { required: true, message: '请输入邀请者名称' },
            { max: 16, message: l10n.t('名称过长') },
          ]}
        >
          <Input
            style={{ width: 256 }}
            maxLength={16}
            placeholder="Add name to add member"
          />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 4, span: 20 }} style={{ marginBottom: 0 }}>
          <Space>
            <Button
              htmlType="submit"
              onClick={() => {
                addMember();
              }}
              disabled={formValues && !formValues.name}
              loading={addLoading}
            >
              Invite
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
          <Tooltip key={item.name} title={`${item.name}`}>
            <Avatar
              shape="square"
              style={{ backgroundColor: item.color, cursor: 'pointer' }}
            >
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
        overlayStyle={{ width: 372 }}
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
