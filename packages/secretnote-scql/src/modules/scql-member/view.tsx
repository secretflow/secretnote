// The view and component of the member management module on the top-right.

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
  Typography,
} from 'antd';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import './index.less';
import { genericErrorHandler, invert, randomColorByName } from '@/utils';

import { ProjectMemberService } from './service';
import { BrokerService } from '../scql-broker';

/**
 * Get the Id (name) of current project.
 * TODO move to somewhere else
 */
function getProjectId() {
  return window.location.pathname.split('/').pop()!;
}

export const ProjectMemberComponent = () => {
  const [form] = Form.useForm();
  const [addFormVisible, setAddFormVisible] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const instance = useInject<ProjectMemberView>(ViewInstance);
  const { brokerService, memberService } = instance;
  const formValues = Form.useWatch([], form);

  /**
   * Invite a new member to current project.
   */
  const handleInviteMember = async () => {
    const values = await form.validateFields();
    setAddLoading(true);
    try {
      await brokerService.inviteMember(values.name, getProjectId());
      setAddFormVisible(false);
      form.resetFields();
      message.success(l10n.t('邀请已发送'));
    } catch (e) {
      genericErrorHandler(e);
    } finally {
      setAddLoading(false);
    }
    return;
  };

  const addNodeFormContent = (
    <div className="secretnote-add-member">
      <Typography.Title level={5}>{l10n.t('邀请成员')}</Typography.Title>
      <Form
        form={form}
        autoComplete="off"
        requiredMark={false}
        style={{ display: 'flex' }}
      >
        <Form.Item
          label={l10n.t('对方 party 名')}
          name="name"
          rules={[
            {
              required: true,
              message: l10n.t('请输入邀请者名称'),
              transform: (v) => v.trim(),
            },
          ]}
        >
          <Input maxLength={16} />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 4, span: 20 }} style={{ marginBottom: 0 }}>
          <Space>
            <Button
              htmlType="submit"
              onClick={() => handleInviteMember()}
              disabled={formValues && !formValues.name}
              loading={addLoading}
            >
              {l10n.t('邀请')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );

  return (
    <div className="secretnote-scql-member">
      <div>{l10n.t('项目成员')}:&nbsp;</div>
      <Avatar.Group>
        {memberService.members.map((v) => {
          const color = randomColorByName(v.party);
          return (
            <Tooltip
              key={v.party}
              title={`${v.party} ${v.party === brokerService.platformInfo.party ? l10n.t('(本方)') : ''} ${v.isCreator ? l10n.t('(项目主)') : ''}`}
            >
              <Avatar
                shape="square"
                style={{ backgroundColor: color, cursor: 'pointer' }}
              >
                <span style={{ color: invert(color) }}>{v.party[0].toUpperCase()}</span>
              </Avatar>
            </Tooltip>
          );
        })}
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
export class ProjectMemberView extends BaseView {
  view = ProjectMemberComponent;
  readonly brokerService: BrokerService;
  readonly memberService: ProjectMemberService;

  constructor(
    @inject(BrokerService) brokerService: BrokerService,
    @inject(ProjectMemberService) memberService: ProjectMemberService,
  ) {
    super();
    this.brokerService = brokerService;
    this.memberService = memberService;
  }

  onViewMount(): void {
    this.memberService.getProjectMembers(getProjectId()!);
  }
}
