import {
  BaseView,
  DefaultSlotView,
  singleton,
  useInject,
  view,
} from '@difizen/mana-app';
import { Drawer } from 'antd';
import { l10n } from '@difizen/mana-l10n';

import CSVPreviewer from './previewer-csv';
import { FilePreviewService } from './service';

export const FilePreviewComponent = () => {
  const { open, handleClose, file } = useInject<FilePreviewService>(FilePreviewService);

  return (
    <Drawer
      open={open}
      onClose={() => handleClose()}
      title={l10n.t('文件预览: {0}', file.path ?? '-')}
      width={'80%'}
    >
      <CSVPreviewer data={file.content} />
    </Drawer>
  );
};

export const filePreviewViewKey = 'secretnote-file-preview-view';
@singleton()
@view(filePreviewViewKey)
export class FilePreviewView extends BaseView {
  view = FilePreviewComponent;
}
