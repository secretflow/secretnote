import { DefaultSlotView, singleton, Slot, view } from '@difizen/mana-app';
import { BoxPanel } from '@difizen/mana-react';
import { history } from '@/utils';

import { Logo } from '@/assets/svg/logo';
import { Space, Tag } from 'antd';

const { Pane } = BoxPanel;

export enum HeaderArea {
  left = 'header-left',
  right = 'header-right',
}

export const Header: React.FC = () => {
  const reload = () => {
    const pathname = history.location.pathname;
    if (pathname.startsWith('/secretnote')) {
      window.location.href = '/secretnote/project';
      return;
    }
    window.location.reload();
  };

  return (
    <BoxPanel
      direction="left-to-right"
      className="secretnote-header"
      style={{ paddingBottom: '4px' }}
    >
      <Pane flex={1}>
        <div className="logo" onClick={() => reload()}>
          <Logo style={{ width: 26, height: 26, marginRight: 4 }} />
          <Space>
            <span className="title">SecretNote</span>
            <Tag color="blue">SCQL</Tag>
          </Space>
        </div>
      </Pane>
      <Pane flex={1} className="right">
        <Slot name={HeaderArea.right} />
      </Pane>
    </BoxPanel>
  );
};

@singleton()
@view('secretnote-header-view')
export class HeaderView extends DefaultSlotView {
  view = Header;
}
