import { DefaultSlotView, singleton, Slot, view } from '@difizen/mana-app';
import { BoxPanel } from '@difizen/mana-react';
import React from 'react';

import { Logo } from '@/assets/svg';

const { Pane } = BoxPanel;

export enum HeaderArea {
  left = 'header-left',
  right = 'header-right',
}

export const Header: React.FC = () => {
  const reload = () => {
    window.location.reload();
  };

  return (
    <BoxPanel direction="left-to-right" className="secretnote-header">
      <Pane flex={1}>
        <div className="logo" onClick={() => reload()}>
          <Logo style={{ width: 26, height: 26, marginRight: 4 }} />
          <span className="title">SecretNote</span>
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
