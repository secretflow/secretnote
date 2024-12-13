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
  Tooltip,
  Avatar,
  Flex,
  Space,
} from 'antd';
import { Bell, User } from 'lucide-react';

import './index.less';
import { l10n } from '@difizen/mana-l10n';
import {
  _ProjectInvitationRespond,
  _ProjectInvitationStatus,
  BrokerService,
} from '@/modules/scql-broker';
import { genericErrorHandler } from '@/utils';
import { ProjectService } from './service';

export const InvitationNotificationComponent = () => {
  const instance = useInject<InvitationNotificationView>(ViewInstance);
  const { brokerService, projectService } = instance;

  // filter out pending and archived invitations
  const pending = projectService.invitations.filter(
    (v) => v.status === _ProjectInvitationStatus.UNDECIDED,
  );
  const archived = projectService.invitations.filter(
    (v) => v.status !== _ProjectInvitationStatus.UNDECIDED,
  );

  /**
   * Alter invitation status.
   */
  const handleInvitation = async (id: string, respond: _ProjectInvitationRespond) => {
    try {
      await brokerService.processInvitation(id, respond, { passthrough: true });
      message.success(
        l10n.t(
          '成功{0}邀请',
          {
            ACCEPT: l10n.t('接受'),
            DECLINE: l10n.t('拒绝'),
          }[respond],
        ),
      );
      projectService.refreshInvitations();
      setTimeout(() => {
        window.location.reload();
      }, 1500);
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
                  <Flex style={{ width: '100%' }} align="center">
                    <Space direction="vertical" style={{ flex: '1 1 0%' }}>
                      <span>
                        {l10n.t(
                          '{0} 邀请你加入项目 {1}',
                          item.inviter,
                          item.project.name,
                        )}
                      </span>
                      <span>
                        {l10n.t(
                          '项目描述: {0}',
                          item.project.description || l10n.t('无'),
                        )}
                      </span>
                    </Space>
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
                  </Flex>
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
                  <span>{`${item.inviter} 邀请你加入项目 ${item.project.name}`}</span>
                  <span
                    className="action"
                    style={{
                      color:
                        item.status === _ProjectInvitationStatus.ACCEPTED
                          ? 'green'
                          : 'orange',
                    }}
                  >
                    {{
                      UNDECIDED: l10n.t('未确定'),
                      ACCEPTED: l10n.t('已接受'),
                      REJECTED: l10n.t('已拒绝'),
                    }[item.status] || l10n.t('未知')}
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
    <Space className="secretnote-invitation-notification">
      <Popover
        content={
          <Tabs
            defaultActiveKey="1"
            items={items}
            size="small"
            style={{ paddingInline: '8px', paddingBottom: '4px' }}
          />
        }
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
      <Tooltip title={brokerService.platformInfo.party}>
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
    </Space>
  );
};

@singleton()
@view('secretnote-invitation-notification-view')
export class InvitationNotificationView extends BaseView {
  view = InvitationNotificationComponent;
  readonly brokerService: BrokerService;
  readonly projectService: ProjectService;

  constructor(
    @inject(BrokerService) brokerService: BrokerService,
    @inject(ProjectService) projectService: ProjectService,
  ) {
    super();
    this.brokerService = brokerService;
    this.projectService = projectService;
  }

  onViewMount() {
    this.projectService.refreshInvitations();
  }
}
