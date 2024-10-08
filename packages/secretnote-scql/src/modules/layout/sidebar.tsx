// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { BaseView, Contribution } from '@difizen/mana-app';
import {
  contrib,
  DefaultSlotView,
  singleton,
  Slot,
  useInject,
  view,
  ViewInstance,
  ViewManager,
  inject,
} from '@difizen/mana-app';
import { Collapse, Space, Typography } from 'antd';

import { SideBarContribution } from './protocol';

export enum SideBarArea {
  notebook = 'notebook',
  notebookExtra = 'notebookExtra',
  file = 'file',
  FileExtra = 'dataExtra',
  integration = 'integration',
  integrationExtra = 'integrationExtra',
}

// About bar on the bottom of the sidebar
const AboutBarComponent = () => (
  <Space direction="horizontal" align="center" size="large" className="about-bar">
    <Typography.Link href="https://www.secretflow.org.cn/" target="_blank">
      SecretFlow
    </Typography.Link>
    <Typography.Link href="https://github.com/secretflow/secretnote" target="_blank">
      SecretNote
    </Typography.Link>
  </Space>
);

export const aboutBarViewKey = 'aboutBar';
@singleton()
@view('secretnote-scql-aboutBar-view')
export class AboutBarView extends BaseView {
  key = aboutBarViewKey;
  view = AboutBarComponent;
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
      <Space className="bottom-bar" direction="vertical" size="middle">
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
    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    @contrib(SideBarContribution) providers: Contribution.Provider<SideBarContribution>,
    @inject(ViewManager) viewManager: ViewManager,
  ) {
    super(undefined, viewManager);
    this.providers = providers;
  }
}
