import { DefaultSlotView, singleton, Slot, view } from '@difizen/mana-app';
import { BoxPanel } from '@difizen/mana-react';
import './index.less';

export enum PreviewLayoutArea {
  header = 'header',
  main = 'main',
}

const PreviewLayout: React.FC = () => {
  return (
    <BoxPanel direction="top-to-bottom" className="secretnote-page">
      <BoxPanel.Pane defaultSize={48} className="secretnote-page-header">
        <Slot name={PreviewLayoutArea.header} />
      </BoxPanel.Pane>
      <BoxPanel.Pane className="secretnote-page-preview-content">
        <Slot name={PreviewLayoutArea.main} />
      </BoxPanel.Pane>
    </BoxPanel>
  );
};

@singleton()
@view('secretnote-preview-view')
export class PreviewLayoutView extends DefaultSlotView {
  view = PreviewLayout;
}
