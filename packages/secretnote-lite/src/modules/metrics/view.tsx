// The metrics panel component.

import {
  BaseView,
  inject,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import { useEffect } from 'react';

import { MetricsService } from './service';
import Smoothie from './smoothie';

import { l10n } from '@difizen/mana-l10n';
import './index.less';

const MetricsComponent = () => {
  const instance = useInject<MetricsView>(ViewInstance);
  const service = instance.service;
  const { metrics } = service;

  useEffect(() => {
    service.enable();

    return () => {
      service.disable();
    };
  }, []);

  return (
    <div className="secretnote-kernel-status">
      <p>TODO Metrics</p>
      {Object.entries(metrics).map(([id, v]) => (
        <div key={id} className="kernel-status-item">
          <div className="server-name">{v.name}:</div>
          <div className="metrics-item">
            <span className="label">{l10n.t('CPU (%)')}</span>
            <span>{v.cpu.toFixed(2)}</span>
          </div>
          <Smoothie
            data={{ time: Date.now(), value: v.cpu }}
            min={0}
            max={100}
          />
          <div className="metrics-item">
            <span className="label">{l10n.t('内存 (MB)')}</span>
            <span>{(v.memory / 1024 / 1024).toFixed(2)}</span>
          </div>
          <Smoothie
            data={{ time: Date.now(), value: v.memory / 1024 / 1024 }}
            min={0}
            max={4 * 1024} /* 4GB */
          />
        </div>
      ))}
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
