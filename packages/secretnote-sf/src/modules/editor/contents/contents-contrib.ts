import type { ICell, NotebookModel, NotebookOption } from '@difizen/libro-jupyter';
import { ContentContribution, isCode } from '@difizen/libro-jupyter';
import { URI, inject, singleton } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { message } from 'antd';
import { uniq } from 'lodash-es';

import { SecretNoteConfigService } from '@/modules/config';
import type { SecretNoteModel } from '@/modules/editor';
import { NotebookFileService } from '@/modules/notebook';
import { genericErrorHandler, isReadonly, jsonParseSafe } from '@/utils';

@singleton({ contrib: ContentContribution })
export class SecretNoteContentContribution implements ContentContribution {
  protected readonly notebookFileService: NotebookFileService;
  protected readonly configService: SecretNoteConfigService;

  constructor(
    @inject(NotebookFileService) notebookFileService: NotebookFileService,
    @inject(SecretNoteConfigService) configService: SecretNoteConfigService,
  ) {
    this.notebookFileService = notebookFileService;
    this.configService = configService;
  }

  canHandle = () => {
    return 3;
  };

  async loadContent(options: NotebookOption, _model: NotebookModel) {
    const model = _model as SecretNoteModel;
    const fileUri = new URI(options.resource);
    const filePath = fileUri.path.toString();
    const currentFileContents = await this.notebookFileService.getFile(filePath);

    if (currentFileContents) {
      currentFileContents.content.nbformat_minor = 5;
      model.currentFileContents = currentFileContents;
      // use file path as id, will be passed to editor and lsp
      // @see https://github.com/difizen/libro/commit/b91cd7588ba4adcb3ca83f241fe42471b30cdc26#diff-32d01fca78d40feed75dcc29437fae22f74ebe33ec16ee11fde7c6c220bedbdbR23
      model.id = model.filePath = currentFileContents.path;

      // @ts-ignore
      if (!model.quickEditMode && !model.readOnly) {
        model.startKernelConnection();
      }

      const { content } = model.currentFileContents;
      // collect all parties in execution metadata and hint the user if possible
      try {
        if (!isReadonly(this.configService)) {
          const requiredParties = uniq(
            content?.cells
              .map((v: ICell) =>
                // @ts-ignore
                isCode(v) ? jsonParseSafe(v?.metadata?.execution?.parties, []) : [],
              )
              .flat() as string[],
          );
          requiredParties.length &&
            message.info(
              l10n.t(
                `当前 Notebook 需要参与方 {0} 执行，添加完成后请刷新页面`,
                requiredParties.join(', '),
              ),
              5,
            );
        }
      } catch (e) {
        genericErrorHandler(e, { silent: true });
      }

      return content;
    }
  }
}
