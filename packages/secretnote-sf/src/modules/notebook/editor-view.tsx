// The very main editor area.

import type { NotebookView } from '@difizen/libro-jupyter';
import { LibroService } from '@difizen/libro-jupyter';
import {
  DefaultSlotView,
  inject,
  singleton,
  Slot,
  useInject,
  view,
  ViewInstance,
  ViewManager,
  ViewRender,
} from '@difizen/mana-app';
import { useEffect, useState } from 'react';

import { genericErrorHandler } from '@/utils';

import { NotebookFileService } from './service';

export enum EditorArea {
  welcome = 'welcome',
}

export const EditorComponent = () => {
  const [libroView, setLibroView] = useState<NotebookView | undefined>(undefined);
  const instance = useInject<EditorView>(ViewInstance);
  const currentNotebookFile = instance.notebookFileService.currentNotebookFile;

  useEffect(() => {
    if (currentNotebookFile) {
      const options = {
        id: currentNotebookFile.path,
        resource: currentNotebookFile.path,
      };
      instance.libroService
        .getOrCreateView(options)
        .then((v) => {
          if (v) {
            instance.notebookFileService.currentLibroView = v;
            setLibroView(v);
          }
          return;
        })
        .catch(genericErrorHandler);
    }
  }, [currentNotebookFile, instance]);

  // If there is no notebook file opened, show the welcome view.
  if (!currentNotebookFile || !libroView || !libroView.view) {
    return <Slot name={EditorArea.welcome} />;
  }

  return <ViewRender view={libroView} />;
};

@singleton()
@view('secretnote-editor-view')
export class EditorView extends DefaultSlotView {
  view = EditorComponent;
  readonly notebookFileService: NotebookFileService;
  readonly libroService: LibroService;

  constructor(
    @inject(NotebookFileService) notebookFileService: NotebookFileService,
    @inject(LibroService) libroService: LibroService,
    @inject(ViewManager) viewManager: ViewManager,
  ) {
    super(undefined, viewManager);
    this.notebookFileService = notebookFileService;
    this.libroService = libroService;
  }
}
