// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Contribution } from '@difizen/mana-app';
import {
  BaseView,
  contrib,
  inject,
  prop,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import React from 'react';

import { getSearchParams } from '@/utils';

import './index.less';
import { FilePreviewContribution } from './protocol';
import { FileService } from './service';

export const FilePreviewComponent = () => {
  const instance = useInject<FilePreviewView>(ViewInstance);
  const { type, data } = instance;
  const providers = instance.providers.getContributions();
  const hit = providers.find((p) => p.type === type);
  const render: React.ReactElement = hit ? (
    hit.render(data)
  ) : (
    <div className="data-preview">{data}</div>
  );

  return render;
};

@singleton()
@view('file-preview-view')
export class FilePreviewView extends BaseView {
  view = FilePreviewComponent;
  readonly fileService: FileService;
  readonly providers: Contribution.Provider<FilePreviewContribution>;

  @prop()
  data = '';

  @prop()
  type = '';

  constructor(
    @inject(FileService) fileService: FileService,
    @contrib(FilePreviewContribution)
    providers: Contribution.Provider<FilePreviewContribution>,
  ) {
    super();
    this.fileService = fileService;
    this.providers = providers;
  }

  async onViewMount() {
    const [serverId, path] = getSearchParams('serverId', 'path');
    if (serverId && path) {
      const res = await this.fileService.getFileContent(serverId, path);
      if (res) {
        this.data = res.content;
        this.type = this.fileService.getFileExtByPath(path) || 'txt';
      }
    }
  }
}
