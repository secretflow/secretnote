import type { NotebookModel, NotebookOption } from '@difizen/libro-jupyter';
import { ContentContribution } from '@difizen/libro-jupyter';
import { URI, inject, singleton } from '@difizen/mana-app';

import { NotebookFileService } from '@/modules/notebook';
import type { SecretNoteModel } from '../model';

@singleton({ contrib: ContentContribution })
export class SecretNoteContentContribution implements ContentContribution {
  protected readonly notebookFileService: NotebookFileService;

  constructor(@inject(NotebookFileService) notebookFileService: NotebookFileService) {
    this.notebookFileService = notebookFileService;
  }

  canHandle = () => {
    return 3;
  };

  async loadContent(options: NotebookOption, model: NotebookModel) {
    const secretNoteModel = model as SecretNoteModel;
    const fireUri = new URI(options.resource);
    const filePath = fireUri.path.toString();
    const currentFileContents = await this.notebookFileService.getFile(filePath);

    if (currentFileContents) {
      currentFileContents.content.nbformat_minor = 5;
      secretNoteModel.currentFileContents = currentFileContents;
      secretNoteModel.filePath = currentFileContents.path;

      /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
      // @ts-ignore
      if (!secretNoteModel.quickEditMode && !secretNoteModel.readOnly) {
        secretNoteModel.startKernelConnection();
      }

      return secretNoteModel.currentFileContents.content;
    }
  }
}
