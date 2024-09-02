import {
  BaseView,
  inject,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import {
  Popover,
  Empty,
  Button,
  message,
  Badge,
  Tabs,
  type TabsProps,
  Divider,
  Tooltip,
  Avatar,
} from 'antd';
import { Bell, User } from 'lucide-react';

import './index.less';
import { ProjectService, Respond } from './service';

export const InvitationNotificationComponent = () => {
  const instance = useInject<InvitationNotificationView>(ViewInstance);
  const pending = instance.service.invitationList.filter(
    (item) => item.status === Respond.UNDECIDED,
  );
  const archived = instance.service.invitationList.filter(
    (item) => item.status !== Respond.UNDECIDED,
  );

  const handleInvitation = async (id: string, accepted: boolean) => {
    try {
      await instance.service.processInvitation(id, accepted);
      message.success(`${accepted ? 'Accept' : 'Decline'} successfully.`);
    } catch (err) {
      if (err instanceof Error) {
        message.error(err.message);
      }
    }
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Pending',
      children: (
        <div className="secretnote-notification-box">
          {pending.length > 0 ? (
            <ul>
              {pending.map((item) => (
                <li key={item.id}>
                  <span>
                    {`${item.inviter} invites you to participate in the project ${item.project}.`}
                  </span>
                  <Divider
                    type="vertical"
                    style={{ height: '1em', borderInlineStart: '1px solid #d6dee6' }}
                  />
                  <span className="action">
                    <Button onClick={() => handleInvitation(item.id, true)} type="link">
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleInvitation(item.id, false)}
                      type="link"
                    >
                      Decline
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No new notifications."
            />
          )}
        </div>
      ),
    },
    {
      key: '2',
      label: 'Archived',
      children: (
        <div className="secretnote-notification-box">
          {archived.length > 0 ? (
            <ul>
              {archived.map((item) => (
                <li key={item.id}>
                  <span>
                    {`${item.inviter} invites you to participate in the project ${item.project}.`}
                  </span>
                  <Divider
                    type="vertical"
                    style={{ height: '1em', borderInlineStart: '1px solid #d6dee6' }}
                  />
                  <span
                    className="action"
                    style={{
                      color: item.status === Respond.ACCEPTED ? 'green' : 'orange',
                    }}
                  >
                    {Respond[item.status]}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Nothing in Archived."
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="secretnote-invitation-notification">
      <Popover
        content={<Tabs defaultActiveKey="1" items={items} size="small" />}
        title=""
        overlayStyle={{ width: 480 }}
        trigger="click"
        placement="bottomLeft"
        arrow={false}
        overlayClassName="secretnote-notification-popover"
      >
        <Badge dot count={pending.length} color="#1677ff" size="small">
          <Bell color="#40566c" size={18} cursor="pointer" />
        </Badge>
      </Popover>
      <Tooltip title={instance.service.platformInfo.party}>
        <Avatar
          style={{
            backgroundColor: '#87d068',
            marginTop: -2,
            marginLeft: 12,
            cursor: 'pointer',
          }}
          icon={<User size={12} color="#fff" />}
          size="small"
        />
      </Tooltip>
    </div>
  );
};

@singleton()
@view('secretnote-invitation-notification-view')
export class InvitationNotificationView extends BaseView {
  view = InvitationNotificationComponent;
  readonly service: ProjectService;

  constructor(@inject(ProjectService) service: ProjectService) {
    super();
    this.service = service;
  }

  onViewMount(): void {
    this.service.getPlatformInfo();
    this.service.getInvitationList();
  }
}
