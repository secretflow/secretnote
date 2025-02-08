import { DefaultSlotView, singleton, Slot, useInject, view } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { BoxPanel } from '@difizen/mana-react';
import { Space, Tag } from 'antd';
import React from 'react';

import { Logo } from '@/assets/svg';
import { SecretNoteConfigService } from '@/modules/config';
import { isReadonly, showWhenReadonly } from '@/utils';

const { Pane } = BoxPanel;

export enum HeaderArea {
  left = 'header-left',
  right = 'header-right',
}

export const Header: React.FC = () => {
  const configService = useInject(SecretNoteConfigService);

  return (
    <BoxPanel direction="left-to-right" className="secretnote-header">
      <Pane flex={1}>
        <div
          className="logo"
          onClick={() => !isReadonly(configService) && window.location.reload()}
        >
          <Logo style={{ width: 26, height: 26, marginRight: 4 }} />
          <Space>
            <span className="title">SecretNote</span>
            <Tag color="blue">SF</Tag>
            <Tag color="orange" style={showWhenReadonly(configService)}>
              {l10n.t('只读')}
            </Tag>
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
