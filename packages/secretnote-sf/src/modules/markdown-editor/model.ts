import { isReadonly } from '@/utils';
import { CellOptions, LibroCellModel } from '@difizen/libro-jupyter';
import { inject, prop, transient } from '@difizen/mana-app';
import { SecretNoteConfigService } from '../config';

@transient()
export class MarkdownCellModel extends LibroCellModel {
  @prop() mimeType = 'text/x-markdown';
  @prop() isEdit = false;
  @prop() readonly = false;

  constructor(
    @inject(CellOptions) options: CellOptions,
    @inject(SecretNoteConfigService) configService: SecretNoteConfigService,
  ) {
    super(options);

    this.readonly = isReadonly(configService);
  }
}
