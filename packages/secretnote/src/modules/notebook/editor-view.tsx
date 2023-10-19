import { LibroComponent } from '@difizen/libro-jupyter';
import {
  DefaultSlotView,
  inject,
  singleton,
  Slot,
  useInject,
  view,
  ViewInstance,
  ViewManager,
} from '@difizen/mana-app';

import { NotebookFileService } from './service';

export enum EditorArea {
  welcome = 'welcome',
}

export const EditorComponent = () => {
  const instance = useInject<EditorView>(ViewInstance);
  const currentNotebookFile = instance.notebookFileService.currentNotebookFile;

  if (!currentNotebookFile) {
    return <Slot name={EditorArea.welcome} />;
  }

  return (
    <LibroComponent
      options={{ id: currentNotebookFile.path, resource: currentNotebookFile.path }}
    />
  );
};

@singleton()
@view('secretnote-editor-view')
export class EditorView extends DefaultSlotView {
  view = EditorComponent;
  readonly notebookFileService: NotebookFileService;

  constructor(
    @inject(ViewManager) viewManger: ViewManager,
    @inject(NotebookFileService) notebookFileService: NotebookFileService,
  ) {
    super(undefined, viewManger);
    this.notebookFileService = notebookFileService;
  }
}
