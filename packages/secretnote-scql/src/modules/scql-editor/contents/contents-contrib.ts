import type { NotebookModel, NotebookOption } from '@difizen/libro-jupyter';
import { ContentContribution } from '@difizen/libro-jupyter';
import { URI, singleton } from '@difizen/mana-app';

import type { SecretNoteModel } from '../model';
import { drived } from '@/modules/notebook';

@singleton({ contrib: ContentContribution })
export class SQLContentContribution implements ContentContribution {
  canHandle = () => {
    return 3;
  };
  async loadContent(options: NotebookOption, model: NotebookModel) {
    const secretNoteModel = model as SecretNoteModel;
    const fireUri = new URI(options.resource);
    const filePath_ = fireUri.path.toString();
    const filePath = drived(filePath_);

    const currentFileContents = await secretNoteModel.contentsManager.get(filePath);
    if (currentFileContents) {
      currentFileContents.content.nbformat_minor = 5;
      secretNoteModel.currentFileContents = currentFileContents;
      return secretNoteModel.currentFileContents.content;
    }
  }
}
