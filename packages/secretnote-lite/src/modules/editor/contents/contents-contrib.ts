import type { NotebookModel, NotebookOption } from '@difizen/libro-jupyter';
import { ContentContribution } from '@difizen/libro-jupyter';
import { URI, singleton } from '@difizen/mana-app';

import { getRemoteBaseUrl } from '@/utils';

import type { SecretNoteModel } from '../model';

@singleton({ contrib: ContentContribution })
export class SecretNoteContentContribution implements ContentContribution {
  canHandle = () => {
    return 3;
  };

  async loadContent(options: NotebookOption, model: NotebookModel) {
    const secretNoteModel = model as SecretNoteModel;
    const fireUri = new URI(options.resource);
    const filePath = fireUri.path.toString();

    const currentFileContents = await secretNoteModel.contentsManager.get(
      filePath,
      {
        baseUrl: getRemoteBaseUrl(),
        content: true,
      },
    );
    if (currentFileContents) {
      currentFileContents.content.nbformat_minor = 5;
      secretNoteModel.currentFileContents = currentFileContents;
      secretNoteModel.filePath = currentFileContents.path;

      // @ts-ignore
      if (!secretNoteModel.quickEditMode && !secretNoteModel.readOnly) {
        secretNoteModel.startKernelConnection();
      }

      return secretNoteModel.currentFileContents.content;
    }
  }
}
