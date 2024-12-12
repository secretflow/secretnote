// Service for previewing files.

import { inject, prop, singleton } from '@difizen/mana-app';
import type { DSVRowArray } from 'd3-dsv';
import { l10n } from '@difizen/mana-l10n';

import { FileService } from '../service';
import { genericErrorHandler, getErrorString, parseCSV } from '@/utils';
import { message } from 'antd';

export type FilePreviewAs = 'text' | 'table';
export const LEGAL_TABLE_EXTS = ['csv']; // currently only support csv to be displayed as table

@singleton()
export class FilePreviewService {
  protected readonly fileService: FileService;

  @prop() open: boolean = false; // whether the preview drawer is open
  @prop() loading: boolean = false; // whether the preview is loading
  @prop() file: Partial<{
    serverId: string; // which server the file is on
    serverName: string; // name of the server the file is on
    path: string; // path of the file
    as_: FilePreviewAs; // how to display the file content
    content: string; // raw text content of the file
    csv: DSVRowArray<string>; // parsed content of the file, if it's a csv file
  }> = {};

  constructor(@inject(FileService) fileService: FileService) {
    this.fileService = fileService;
  }

  /**
   * Open the preview drawer and display the file content.
   */
  async preview(
    as_: FilePreviewAs,
    serverId: string,
    path: string,
    serverName?: string,
  ) {
    this.loading = true;
    try {
      const isPossibleAsTable = LEGAL_TABLE_EXTS.includes(
        FileService.getFileExtByPath(path) ?? '',
      );
      if (!isPossibleAsTable && as_ === 'table') {
        throw new Error(l10n.t('当前仅 CSV 格式文件可以表格形式预览'));
      }
      // open the drawer and display necessary loading stage
      this.open = true;
      const maybeContentsModal = await this.fileService.getFileContent(
        serverId,
        path,
        'text', // TODO this is not working? The response's format might still be `json`.
      );
      if (!maybeContentsModal) {
        throw new Error(l10n.t('读取文件内容失败'));
      }
      // make it must a string to avoid crashing
      const { content: anyContent, format } = maybeContentsModal;
      const content =
        format === 'json'
          ? JSON.stringify(anyContent, null, 2) // might be improper‌ since it's not the actual content inside
          : format === 'base64'
            ? anyContent // currently we don't decode it
            : anyContent;
      this.file = {
        as_,
        serverId,
        serverName,
        path,
        content,
        csv:
          as_ === 'table' && isPossibleAsTable
            ? parseCSV(maybeContentsModal.content)
            : void 0,
      };
    } catch (e) {
      message.error(l10n.t('文件预览失败: {0}', getErrorString(e)));
      genericErrorHandler(e, { silent: true });
      this.open = false;
    } finally {
      this.loading = false;
    }
  }

  close() {
    this.file = {};
    this.open = false;
  }
}
