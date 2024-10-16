// The metrics panel component.

import {
  BaseView,
  inject,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { useEffect } from 'react';

import { convertSizeUnit } from '@/utils';
import { Tag } from 'antd';
import './index.less';
import { MetricsService } from './service';

const MetricsComponent = () => {
  const instance = useInject<MetricsView>(ViewInstance);
  const service = instance.service;
  const { metrics, status } = service;

  useEffect(() => {
    service.enable();

    return () => {
      service.disable();
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  const formatMetric = (v: (typeof metrics)[1]) =>
    `${l10n.t('CPU')} ${v.cpu.toFixed(1)} (%)` +
    ` / ${l10n.t('内存')} ` +
    `${convertSizeUnit(v.memory, 'GB').toFixed(1)} (GB)`;

  return (
    <div className="secretnote-kernel-status">
      <p className="title">{l10n.t('节点监控')}</p>

      {Object.keys(metrics).length > 0 ? (
        Object.entries(metrics).map(([id, v]) => (
          <div key={id} className="kernel-status-item">
            <div className="server-name">{v.name}</div>
            <Tag style={{ fontFamily: 'monospace, monospace' }}>{formatMetric(v)}</Tag>
          </div>
        ))
      ) : (
        <div className="kernel-status-item">
          <span className="placeholder">
            {status === 'no_notebook'
              ? l10n.t('暂无打开的 Notebook')
              : l10n.t('暂无数据')}
          </span>
        </div>
      )}
    </div>
  );
};

@singleton()
@view('secretnote-metrics-view')
export class MetricsView extends BaseView {
  view = MetricsComponent;
  service: MetricsService;

  constructor(@inject(MetricsService) service: MetricsService) {
    super();

    this.service = service;
  }
}
