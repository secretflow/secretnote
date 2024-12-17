import { DefaultSlotView, singleton, Slot, view } from '@difizen/mana-app';
import { BoxPanel, SplitPanel } from '@difizen/mana-react';
import React from 'react';

import './index.less';

export enum LayoutArea {
  header = 'header',
  sidebar = 'sidebar',
  main = 'main',
}

const SecreteNoteLayout: React.FC = () => {
  return (
    <BoxPanel direction="top-to-bottom" className="secretnote-page">
      <BoxPanel.Pane defaultSize={48} className="secretnote-page-header">
        <Slot name={LayoutArea.header} />
      </BoxPanel.Pane>
      <SplitPanel id="split-panel" direction="left-to-right">
        <SplitPanel.Pane
          id="split-panel-left"
          className="secretnote-split-panel-left"
          defaultSize={280}
          minSize={280}
          maxSize={320}
        >
          <Slot name={LayoutArea.sidebar} />
        </SplitPanel.Pane>
        <SplitPanel.Pane id="split-panel-right" minSize={400} flex={1} flexGrow={1}>
          <Slot name={LayoutArea.main} />
        </SplitPanel.Pane>
      </SplitPanel>
    </BoxPanel>
  );
};

@singleton()
@view('secretnote-layout-view')
export class LayoutView extends DefaultSlotView {
  view = SecreteNoteLayout;
}
