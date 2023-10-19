import {
  BaseView,
  inject,
  ModalService,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import { Tooltip } from 'antd';
import { Plus } from 'lucide-react';

import { DropdownMenu } from '@/components/dropdown-menu';

import { IntegrationService } from './service';

export const ExtraComponent = () => {
  const instance = useInject<ExtraView>(ViewInstance);

  return (
    <DropdownMenu
      icon={
        <Tooltip title="Create a new integration">
          <Plus size={14} />
        </Tooltip>
      }
      items={instance.service.getAllIntegrationMeta().map((p) => ({
        key: p.type,
        label: p.label,
        icon: p.icon,
      }))}
      onClick={(key) => {
        const meta = instance.service.getIntegrationMeta(key);
        if (meta) {
          instance.modalService.openModal(meta.configPanel);
        }
      }}
    />
  );
};

@singleton()
@view('integration-extra-view')
export class ExtraView extends BaseView {
  view = ExtraComponent;

  readonly service: IntegrationService;
  readonly modalService: ModalService;

  constructor(
    @inject(IntegrationService) service: IntegrationService,
    @inject(ModalService) modalService: ModalService,
  ) {
    super();
    this.service = service;
    this.modalService = modalService;
  }
}
