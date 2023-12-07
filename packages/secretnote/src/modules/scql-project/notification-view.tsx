import {
  BaseView,
  inject,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import { Popover, Table, Button, message } from 'antd';
import { BellRing } from 'lucide-react';

import './index.less';
import { ProjectService, type Invitation } from './service';

export const InvitationNotificationComponent = () => {
  const instance = useInject<InvitationNotificationView>(ViewInstance);

  const handleAccept = async (id: string) => {
    try {
      await instance.service.processInvitation(id, true);
      message.success('Invitation accepted.');
    } catch (err) {
      if (err instanceof Error) {
        message.error(err.message);
      }
    }
  };

  const notificationList = (
    <div className="notification-list">
      <Table
        dataSource={instance.service.invitationList}
        rowKey="id"
        size="small"
        pagination={false}
        columns={[
          {
            title: 'Inviter',
            dataIndex: 'inviter',
            key: 'inviter',
          },
          {
            title: 'Project',
            dataIndex: 'project',
            key: 'project',
          },
          {
            title: 'Status',
            dataIndex: 'accepted',
            key: 'accepted',
            render: (accepted: number) => (accepted === 1 ? 'Accepted' : 'Pending'),
          },
          {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render: (_: any, record: Invitation) => {
              if (record.accepted === 0) {
                return (
                  <Button onClick={() => handleAccept(record.id)} type="link">
                    Accept
                  </Button>
                );
              }

              return <span>--</span>;
            },
          },
        ]}
      />
    </div>
  );

  return (
    <div className="secretnote-invitation-notification">
      <Popover
        content={notificationList}
        title=""
        overlayStyle={{ width: 446 }}
        trigger="hover"
        placement="bottomLeft"
        arrow={false}
      >
        <BellRing color="#182431" size={16} cursor="pointer" />
      </Popover>
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
    this.service.getInvitationList();
  }
}
