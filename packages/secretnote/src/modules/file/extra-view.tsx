import {
  BaseView,
  inject,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import { message, Tooltip } from 'antd';
import { RefreshCw } from 'lucide-react';

import { FileService } from './service';

export const ExtraComponent = () => {
  const instance = useInject<ExtraView>(ViewInstance);

  return (
    <Tooltip title="Refresh files">
      <RefreshCw
        size={14}
        onClick={(e) => {
          e.stopPropagation();
          instance.fileService.getFileTree();
          message.success('File list refreshed.');
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
