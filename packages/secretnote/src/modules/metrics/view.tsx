import type { ModalItem, ModalItemProps } from '@difizen/mana-app';
import { useInject } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { Badge, Drawer } from 'antd';

import { Smoothie } from '@/components/smoothie';

import { MetricsService } from './service';

import './index.less';

const MetricsComponent = (props: ModalItemProps<void>) => {
  const { visible, close } = props;
  const metricsService = useInject<MetricsService>(MetricsService);
  const { metrics } = metricsService;

  const afterOpenChange = async (open: boolean) => {
    if (open) {
      metricsService.enable();
    }
  };

  const onClose = () => {
    metricsService.disable();
    close();
  };

  return (
    <Drawer
      placement="right"
      onClose={() => onClose()}
      width={360}
      open={visible}
      mask={false}
      afterOpenChange={afterOpenChange}
      destroyOnClose={true}
      title={l10n.t('资源消耗')}
    >
      <div className="secretnote-kernel-status">
        {metrics.map((item) => (
          <div key={item.kernel.id} className="kernel-status-item">
            <div className="server-name">{item.server.name}:</div>
            <div className="metrics-item">
              <span className="label">{l10n.t('名称')}:</span>
              <span>{item.kernel.name}</span>
            </div>
            <div className="metrics-item">
              <span className="label">{l10n.t('状态')}:</span>
              <Badge color={item.kernel.statusColor} text={item.kernel.statusText} />
            </div>
            <div className="metrics-item">
              <span className="label">PID:</span>
              <span>{item.kernel.pid}</span>
            </div>
            <div className="metrics-item">
              <span className="label">CPU:</span>
              <span>{item.kernel.cpuText}</span>
            </div>
            <Smoothie data={{ time: Date.now(), data: item.kernel.cpu }} />
            <div className="metrics-item">
              <span className="label">RAM:</span>
              <span>{item.kernel.memoryText}</span>
            </div>
            <Smoothie data={{ time: Date.now(), data: item.kernel.memory }} />
          </div>
        ))}
      </div>
    </Drawer>
  );
};

export const MetricsModal: ModalItem = {
  id: 'secretnote-metrics-panel-modal',
  component: MetricsComponent,
};
