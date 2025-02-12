// The very main editor area (readonly mode).
// see `src/modules/notebook/editor-view.tsx`

import type { NotebookView } from '@difizen/libro-jupyter';
import { LibroService } from '@difizen/libro-jupyter';
import {
  DefaultSlotView,
  inject,
  singleton,
  useInject,
  view,
  ViewInstance,
  ViewManager,
  ViewRender,
} from '@difizen/mana-app';
import { useEffect, useState } from 'react';

import { genericErrorHandler } from '@/utils';

import { PreviewNotebookFileService } from './service';

export const EditorComponent = () => {
  const [libroView, setLibroView] = useState<NotebookView | undefined>(undefined);
  const instance = useInject<PreviewEditorView>(ViewInstance);
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
        })
        .catch(genericErrorHandler);
    }
  }, [currentNotebookFile, instance]);

  // If there is no notebook file opened, show nothing.
  if (!currentNotebookFile || !libroView || !libroView.view) {
    return null;
  }

  return <ViewRender view={libroView} />;
};

@singleton()
@view('secretnote-preview-editor-view')
export class PreviewEditorView extends DefaultSlotView {
  view = EditorComponent;
  readonly notebookFileService: PreviewNotebookFileService;
  readonly libroService: LibroService;

  constructor(
    @inject(PreviewNotebookFileService) notebookFileService: PreviewNotebookFileService,
    @inject(LibroService) libroService: LibroService,
    @inject(ViewManager) viewManager: ViewManager,
  ) {
    super(undefined, viewManager);
    this.notebookFileService = notebookFileService;
    this.libroService = libroService;
  }
}
