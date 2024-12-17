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
import { l10n } from '@difizen/mana-l10n';
import { Collapse, Space, Tag, Typography } from 'antd';

import { SideBarContribution } from '@/modules/layout';
import { BrokerService } from '@/modules/scql-broker';

export enum SideBarArea {
  notebook = 'notebook',
  notebookExtra = 'notebookExtra',
  file = 'file',
  FileExtra = 'dataExtra',
  integration = 'integration',
  integrationExtra = 'integrationExtra',
}

// About bar on the bottom of the sidebar
const AboutBarComponent = () => {
  const brokerService = useInject<BrokerService>(BrokerService);
  const { platformInfo } = brokerService;

  return (
    <Space direction="vertical" className="about-bar">
      <Space direction="vertical">
        <p className="title">{l10n.t('平台信息')}</p>
        <Space direction="vertical">
          <Tag>
            {l10n.t('本方')}: {platformInfo.party}
          </Tag>
          <Tag>Broker: {platformInfo.broker}</Tag>
        </Space>
      </Space>
      {/* Links to SecretFlow and SecretNote sites */}
      <Space direction="horizontal" align="center" size="large">
        <Typography.Link href="https://www.secretflow.org.cn/" target="_blank">
          SecretFlow
        </Typography.Link>
        <Typography.Link
          href="https://github.com/secretflow/secretnote"
          target="_blank"
        >
          SecretNote
        </Typography.Link>
      </Space>
    </Space>
  );
};

export const aboutBarViewKey = 'scql-aboutBar';
@singleton()
@view('secretnote-scql-aboutBar-view')
export class AboutBarView extends BaseView {
  key = aboutBarViewKey;
  view = AboutBarComponent;

  constructor() {
    super();
  }
}

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
      <div className="bottom-bar">
        <Slot name={aboutBarViewKey} />
      </div>
    </div>
  );
};

@singleton()
@view('secretnote-sidebar-view')
export class SideBarView extends DefaultSlotView {
  view = SideBar;
  readonly providers: Contribution.Provider<SideBarContribution>;

  constructor(
    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    @contrib(SideBarContribution) providers: Contribution.Provider<SideBarContribution>,
    @inject(ViewManager) viewManager: ViewManager,
  ) {
    super(undefined, viewManager);
    this.providers = providers;
  }
}
