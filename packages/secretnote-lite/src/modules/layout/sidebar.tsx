// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Contribution } from '@difizen/mana-app';
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
import { Collapse } from 'antd';
import React from 'react';

import { SideBarContribution } from './protocol';

export enum SideBarArea {
  notebook = 'notebook',
  notebookExtra = 'notebookExtra',
  file = 'file',
  FileExtra = 'dataExtra',
  integration = 'integration',
  integrationExtra = 'integrationExtra',
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
    @contrib(SideBarContribution) providers: Contribution.Provider<SideBarContribution>,
    @inject(ViewManager) viewManager: ViewManager,
  ) {
    super(undefined, viewManager);
    this.providers = providers;
  }
}
