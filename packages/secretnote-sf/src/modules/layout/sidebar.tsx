// Sidebar is the bar displayed on the left which displays notebook file list, server data file list,
// node CPU/MEM usage, and "about" information of the application.

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  BaseView,
  contrib,
  Contribution,
  DefaultSlotView,
  inject,
  singleton,
  Slot,
  useInject,
  view,
  ViewInstance,
  ViewManager,
} from '@difizen/mana-app';
import { Collapse, Space, Tooltip, Typography } from 'antd';
import { InfoIcon } from 'lucide-react';
import React from 'react';

import LibroJupyterPkgJSON from '@difizen/libro-jupyter/package.json';
import ManaAppPkgJSON from '@difizen/mana-app/package.json';
import SecretNotePkgJSON from '../../../package.json';

import { l10n } from '@difizen/mana-l10n';
import { SideBarContribution } from './protocol';

export const metricsMonitorKey = 'metricsMonitor';

// About bar on the bottom of the sidebar
const AboutBarComponent = () => {
  const instance = useInject<AboutBarView>(ViewInstance);
  const fmtPackageVersions = instance.fmtPackageVersions;

  return (
    <Space direction="horizontal" align="center" size="large" className="about-bar">
      <Typography.Link href="https://www.secretflow.org.cn/" target="_blank">
        SecretFlow
      </Typography.Link>
      <Typography.Link href="https://github.com/secretflow/secretnote" target="_blank">
        SecretNote
      </Typography.Link>
      <div className="icon-container">
        <Tooltip title={fmtPackageVersions}>
          <InfoIcon size={16} />
        </Tooltip>
      </div>
    </Space>
  );
};

export const aboutBarViewKey = 'aboutBar';
@singleton()
@view('secretnote-aboutBar-view')
export class AboutBarView extends BaseView {
  key = aboutBarViewKey;
  view = AboutBarComponent;

  // expose versions of important packages
  packageVersions = {
    'secretnote-lite': SecretNotePkgJSON.version,
    'libro-jupyter': LibroJupyterPkgJSON.version,
    'mana-app': ManaAppPkgJSON.version,
  } as const;
  fmtPackageVersions: string;

  constructor() {
    super();
    this.fmtPackageVersions =
      l10n.t('版本信息') +
      ': ' +
      Object.entries(this.packageVersions)
        .map(([k, v]) => `${k}@${v ?? '-'}`)
        .join('; ');
  }
}

// Compose the sidebar with contributions from each part
export const SideBar: React.FC = () => {
  const instance = useInject<SideBarView>(ViewInstance);
  const providers = instance.providers.getContributions();
  providers.sort((a, b) => a.order - b.order);
  const defaultActiveKey = providers.filter((p) => !!p.defaultOpen).map((p) => p.key);

  const items = providers
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      key: item.key,
      label: item.label,
      children: <Slot name={item.key} />,
      extra: (
        <span className="secretnote-sidebar-extra">
          <Slot name={`${item.key}Extra`} />
        </span>
      ),
    }));

  return (
    <div className="secretnote-sidebar">
      <Collapse defaultActiveKey={defaultActiveKey} ghost items={items} />
      <Space className="bottom-bar" direction="vertical" size="middle">
        <Slot name={metricsMonitorKey} />
        <Slot name={aboutBarViewKey} />
      </Space>
    </div>
  );
};

@singleton()
@view('secretnote-sidebar-view')
export class SideBarView extends DefaultSlotView {
  view = SideBar;
  readonly providers: Contribution.Provider<SideBarContribution>;

  constructor(
    // @ts-ignore
    @contrib(SideBarContribution)
    providers: Contribution.Provider<SideBarContribution>,
    @inject(ViewManager) viewManager: ViewManager,
  ) {
    super(undefined, viewManager);
    this.providers = providers;
  }
}
