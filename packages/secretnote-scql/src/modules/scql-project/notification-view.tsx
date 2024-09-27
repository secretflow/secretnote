// The notifications panel after clicking the bell icon on the top right.

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
import { l10n } from '@difizen/mana-l10n';
import {
  _ProjectInvitationRespond,
  _ProjectInvitationStatus,
  SCQLBrokerService,
} from '@/modules/scql-broker';
import { genericErrorHandler } from '@/utils';

export const InvitationNotificationComponent = () => {
  const instance = useInject<InvitationNotificationView>(ViewInstance);
  const service = instance.service;

  // filter out pending and archived invitations
  const pending = service.invitations.filter(
    (v) => v.status === _ProjectInvitationStatus.UNDECIDED,
  );
  const archived = service.invitations.filter(
    (v) => v.status !== _ProjectInvitationStatus.UNDECIDED,
  );

  /**
   * Alter invitation status.
   */
  const handleInvitation = async (id: string, to: _ProjectInvitationRespond) => {
    try {
      await service.processInvitation(id, to);
      message.success(
        l10n.t(
          '成功{0}邀请',
          {
            ACCEPT: '接受',
            DECLINE: '拒绝',
          }[to],
        ),
      );
    } catch (e) {
      genericErrorHandler(e);
    }
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: l10n.t('待处理'),
      children: (
        <div className="secretnote-notification-box">
          {pending.length > 0 ? (
            <ul>
              {pending.map((item) => (
                <li key={item.invitation_id}>
                  <span>{`${item.inviter} 邀请你加入项目 ${item.project}`}</span>
                  <Divider
                    type="vertical"
                    style={{ height: '1em', borderInlineStart: '1px solid #d6dee6' }}
                  />
                  <span className="action">
                    <Button
                      onClick={() => handleInvitation(item.invitation_id, 'ACCEPT')}
                      type="link"
                    >
                      {l10n.t('接受')}
                    </Button>
                    <Button
                      onClick={() => handleInvitation(item.invitation_id, 'DECLINE')}
                      type="link"
                    >
                      {l10n.t('拒绝')}
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={l10n.t('暂无')} />
          )}
        </div>
      ),
    },
    {
      key: '2',
      label: l10n.t('已完成'),
      children: (
        <div className="secretnote-notification-box">
          {archived.length > 0 ? (
            <ul>
              {archived.map((item) => (
                <li key={item.invitation_id}>
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
                      color:
                        item.status === _ProjectInvitationStatus.ACCEPTED
                          ? 'green'
                          : 'orange',
                    }}
                  >
                    {
                      {
                        UNDECIDED: '未确定',
                        ACCEPTED: '已接受',
                        REJECTED: '已拒绝',
                      }[item.status]
                    }
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={l10n.t('暂无')} />
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
      <Tooltip title={service.platformInfo.party}>
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
  readonly service: SCQLBrokerService;

  constructor(@inject(SCQLBrokerService) service: SCQLBrokerService) {
    super();
    this.service = service;
  }
}
