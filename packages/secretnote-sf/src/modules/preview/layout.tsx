import { DefaultSlotView, singleton, Slot, view } from '@difizen/mana-app';
import { BoxPanel, SplitPanel } from '@difizen/mana-react';
import React from 'react';

import '@/modules/layout/index.less';
import './index.less';

export enum LayoutArea {
  header = 'header',
  sidebar = 'sidebar',
  main = 'main',
}

const PreviewSecreteNoteLayout: React.FC = () => {
  return (
    <BoxPanel direction="top-to-bottom" className="secretnote-page">
      <BoxPanel.Pane defaultSize={48} className="secretnote-page-header">
        <Slot name={LayoutArea.header} />
      </BoxPanel.Pane>
      <SplitPanel id="split-panel" direction="left-to-right">
        <SplitPanel.Pane
          id="split-panel-left"
          className="secretnote-split-panel-left"
          // hide the left sidebar when preview
          defaultSize={0}
          minSize={0}
          maxSize={0}
        >
          <Slot name={LayoutArea.sidebar} />
        </SplitPanel.Pane>
        <SplitPanel.Pane
          id="split-panel-right"
          minSize={400}
          flex={1}
          flexGrow={1}
          className="secretnote-split-panel-right"
        >
          <Slot name={LayoutArea.main} />
        </SplitPanel.Pane>
      </SplitPanel>
    </BoxPanel>
  );
};

@singleton()
@view('secretnote-preview-layout-view')
export class PreviewLayoutView extends DefaultSlotView {
  view = PreviewSecreteNoteLayout;
}
