import {
  BaseView,
  inject,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import { Drawer } from 'antd';
import { l10n } from '@difizen/mana-l10n';

import CSVPreviewer from './previewer-csv';
import { FilePreviewService } from './service';
export const FilePreviewComponent = () => {
  const instance = useInject<FilePreviewView>(ViewInstance);
  const service = instance.filePreviewService;
  const { file } = service;

  return (
    <Drawer
      loading={service.loading}
      open={service.open}
      onClose={() => service.close()}
      title={
        <>
          {l10n.t(
            '文件预览 (节点: {0}, 路径: {1})',
            file.serverName ?? file.serverId ?? '-',
            file.path ?? '-',
          )}
        </>
      }
      width={'80%'}
    >
      <CSVPreviewer dataSource={file.csv} />
    </Drawer>
  );
};

export const filePreviewViewKey = 'secretnote-file-preview-view';
@singleton()
@view(filePreviewViewKey)
export class FilePreviewView extends BaseView {
  readonly filePreviewService: FilePreviewService;
  view = FilePreviewComponent;

  constructor(@inject(FilePreviewService) filePreviewService: FilePreviewService) {
    super();
    this.filePreviewService = filePreviewService;
  }
}
