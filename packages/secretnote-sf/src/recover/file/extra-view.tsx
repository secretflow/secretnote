import {
  BaseView,
  inject,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { message, Tooltip } from 'antd';
import { RefreshCw } from 'lucide-react';

import { FileService } from './service';

export const ExtraComponent = () => {
  const instance = useInject<ExtraView>(ViewInstance);

  return (
    <Tooltip title={l10n.t('刷新')}>
      <RefreshCw
        size={14}
        onClick={(e) => {
          e.stopPropagation();
          instance.fileService.getFileTree();
          message.success(l10n.t('文件列表已刷新'));
        }}
      />
    </Tooltip>
  );
};

@singleton()
@view('file-extra-view')
export class ExtraView extends BaseView {
  readonly fileService: FileService;

  view = ExtraComponent;

  constructor(@inject(FileService) fileService: FileService) {
    super();
    this.fileService = fileService;
  }
}
