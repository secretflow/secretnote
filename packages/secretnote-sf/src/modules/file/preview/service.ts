import { inject, prop, singleton } from '@difizen/mana-app';

import { FileService } from '../service';

@singleton()
export class FilePreviewService {
  protected readonly fileService: FileService;
  @prop() open: boolean = false;
  @prop() file: {
    path: string;
    content: string;
  } = { path: '', content: '' };

  constructor(@inject(FileService) fileService: FileService) {
    this.fileService = fileService;
  }

  async preview(serverId: string, path: string) {
    const maybeContent = await this.fileService.getFileContent(serverId, path, 'text');
    if (!maybeContent) {
      return;
    }
    this.file = {
      path,
      content: maybeContent.content,
    };
    this.open = true;
    console.log('after open', this);
    // @ts-ignore
    window.$temp1 = this;
  }

  handleClose() {
    console.log('when close, we get', this);
    // @ts-ignore
    window.$temp2 = this;

    // this.file = { path: '', content: '' };
    // this.open = false;
  }
}
