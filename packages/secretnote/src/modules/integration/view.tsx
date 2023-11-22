import {
  BaseView,
  inject,
  ModalService,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { message, Modal } from 'antd';
import { PenLine, Trash } from 'lucide-react';

import { DropdownMenu } from '@/components/dropdown-menu';
import { SideBarContribution } from '@/modules/layout';

import './index.less';
import type { Integration } from './protocol';
import { IntegrationService } from './service';

export const IntegrationComponent = () => {
  const instance = useInject<IntegrationView>(ViewInstance);
  const service = instance.service;

  const onMenuClick = async (key: string, integration: Integration) => {
    const meta = service.getIntegrationMeta(integration.type);
    switch (key) {
      case 'edit':
        if (meta) {
          instance.modalService.openModal<Integration['attrs']>(meta.configPanel, {
            name: integration.name,
            ...integration.attrs,
          });
        }
        break;
      case 'delete':
        Modal.confirm({
          title: 'Delete Integration?',
          centered: true,
          content: `The integration ${integration.name} will be deleted.`,
          okText: 'Delete Integration',
          cancelText: 'Cancel',
          okType: 'danger',
          async onOk(close) {
            await service.deleteIntegration(integration.name);
            await service.getIntegrations();
            message.success('Integration deleted.');
            return close(Promise.resolve);
          },
        });
        break;
      default:
        break;
    }
  };

  return (
    <ul className="secretnote-integration-list">
      {service.integrations.map((item) => (
        <li key={item.name}>
          <span className="title">
            {service.getIntegrationMeta(item.type)?.icon}
            <span className="name">{item.name}</span>
          </span>
          <DropdownMenu
            items={[
              { key: 'edit', label: 'Edit', icon: <PenLine size={12} /> },
              { type: 'divider' },
              {
                key: 'delete',
                label: 'Delete',
                icon: <Trash size={12} />,
                danger: true,
              },
            ]}
            onClick={(key) => {
              onMenuClick(key, item);
            }}
          />
        </li>
      ))}
    </ul>
  );
};

export const integrationViewKey = 'integration';
@singleton({ contrib: [SideBarContribution] })
@view('secretnote-integration-view')
export class IntegrationView extends BaseView implements SideBarContribution {
  key = integrationViewKey;
  label = l10n.t('集成');
  order = 3;
  defaultOpen = false;
  view = IntegrationComponent;
  readonly service: IntegrationService;
  readonly modalService: ModalService;

  constructor(
    @inject(IntegrationService) service: IntegrationService,
    @inject(ModalService) modalService: ModalService,
  ) {
    super();
    this.service = service;
    this.modalService = modalService;
    this.service.getIntegrations();
  }
}
