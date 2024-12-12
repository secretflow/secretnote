// Service for previewing files.

import { inject, prop, singleton } from '@difizen/mana-app';
import type { DSVRowArray } from 'd3-dsv';
import { l10n } from '@difizen/mana-l10n';

import { FileService } from '../service';
import { genericErrorHandler, parseCSV } from '@/utils';

@singleton()
export class FilePreviewService {
  protected readonly fileService: FileService;

  @prop() open: boolean = false; // whether the preview drawer is open
  @prop() loading: boolean = false; // whether the preview is loading
  @prop() file: Partial<{
    serverId: string; // which server the file is on
    serverName: string; // name of the server the file is on
    path: string; // path of the file
    content: string; // raw text content of the file
    csv: DSVRowArray<string>; // parsed content of the file, if it's a csv file
  }> = {};

  constructor(@inject(FileService) fileService: FileService) {
    this.fileService = fileService;
  }

  /**
   * Open the preview drawer and display the file content.
   */
  async preview(serverId: string, path: string, serverName?: string) {
    this.loading = true;
    try {
      this.open = true;
      const maybeContent = await this.fileService.getFileContent(
        serverId,
        path,
        'text',
      );
      if (!maybeContent) {
        throw new Error(l10n.t('读取文件内容失败'));
      }
      this.file = {
        serverId,
        serverName,
        path,
        content: maybeContent.content,
      };
      if (FileService.getFileExtByPath(path)?.toLowerCase() === 'csv') {
        this.file.csv = parseCSV(maybeContent.content);
      }
    } catch (e) {
      genericErrorHandler(e);
    } finally {
      this.loading = false;
    }
  }

  close() {
    this.file = {};
    this.open = false;
  }
}
