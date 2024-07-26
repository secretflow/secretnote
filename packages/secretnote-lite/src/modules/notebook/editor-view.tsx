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
  ViewRender,
  ViewManager,
} from '@difizen/mana-app';
import { useEffect, useState } from 'react';
import React from 'react';

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
          if (!v) {
            return;
          }
          instance.notebookFileService.currentLibroView = v;
          setLibroView(v);
          return;
        })
        .catch((e) => {
          console.error('getOrCreateView fail', e);
        });
    }
  }, [currentNotebookFile, instance]);

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
    @inject(ViewManager) viewManger: ViewManager,
  ) {
    super(undefined, viewManger);
    this.notebookFileService = notebookFileService;
    this.libroService = libroService;
  }
}
