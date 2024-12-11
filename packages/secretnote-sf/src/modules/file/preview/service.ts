import { inject, prop, singleton } from '@difizen/mana-app';

import { FileService } from '../service';

@singleton()
export class FilePreviewService {
  // protected readonly fileService: FileService;
  protected readonly fileService: FileService;
  @prop() previewOpen: boolean = false;
  @prop() file: {
    ext?: string;
    content: string;
  } = { content: '' };

  constructor(@inject(FileService) fileService: FileService) {
    this.fileService = fileService;
  }

  async preview(serverId: string, path: string) {
    const maybeContent = await this.fileService.getFileContent(serverId, path, 'text');
    if (!maybeContent) {
      return;
    }
    this.file = {
      ext: this.fileService.getFileExtByPath(path)?.toLowerCase(),
      content: maybeContent.content,
    };
    this.previewOpen = true;
  }

  close() {
    this.file = { content: '' };
    this.previewOpen = false;
  }
}
