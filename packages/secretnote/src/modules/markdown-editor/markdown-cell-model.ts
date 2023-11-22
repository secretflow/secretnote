import { CellOptions, LibroCellModel } from '@difizen/libro-jupyter';
import { prop } from '@difizen/mana-app';
import { inject, transient } from '@difizen/mana-app';

@transient()
export class MarkdownCellModel extends LibroCellModel {
  @prop()
  mimeType = 'text/x-markdown';

  @prop()
  isEdit = false;

  constructor(@inject(CellOptions) options: CellOptions) {
    super(options);
  }
}
