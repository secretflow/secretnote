import {
  BaseView,
  inject,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { Alert, Drawer, Flex } from 'antd';

import CSVPreviewer from './previewer-csv';
import { FilePreviewService } from './service';

const MAX_PREVIEW_LENGTH = 100000;

export const FilePreviewComponent = () => {
  const instance = useInject<FilePreviewView>(ViewInstance);
  const service = instance.filePreviewService;
  const { file } = service;
  const isTooLong = (file.content?.length ?? 0) > MAX_PREVIEW_LENGTH,
    truncated = (file.content ?? '').substring(0, MAX_PREVIEW_LENGTH);

  return (
    <Drawer
      loading={service.loading}
      open={service.open}
      onClose={() => service.close()}
      title={
        <Flex justify="space-between" align="center">
          <div>
            {l10n.t(
              '预览 ({0} 的 {1})',
              file.serverName ?? file.serverId ?? '-',
              file.path ?? '-',
            )}
          </div>
          {isTooLong && file.as_ === 'text' && (
            <Alert
              message={
                <span style={{ fontWeight: 'normal' }}>
                  {l10n.t('文件内容过长，仅展示前 {0} 个字符', MAX_PREVIEW_LENGTH)}
                </span>
              }
              type="warning"
              showIcon
            />
          )}
        </Flex>
      }
      width="80%"
    >
      {file.as_ === 'text' && (
        <pre
          style={{
            fontFamily: 'monospace, monospace',
            fontSize: '13px',
            lineHeight: '1.5',
          }}
        >
          {truncated}
        </pre>
      )}
      {file.as_ === 'table' && <CSVPreviewer dataSource={file.csv} />}
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
