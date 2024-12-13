import {
  BaseView,
  inject,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import type { UploadProps } from 'antd';
import { message, Modal, Space, Tooltip, Upload } from 'antd';
import { Plus, Upload as UploadIcon } from 'lucide-react';

import { readFile } from '@/utils';
import { NotebookFileService } from './service';

export const ExtraComponent = () => {
  const instance = useInject<ExtraView>(ViewInstance);

  const uploadFile = async (file: File) => {
    const content = await readFile(file);
    await instance.notebookFileService.uploadFile(file.name, content);
    message.success(l10n.t('Notebook 上传成功'));
  };

  const props: UploadProps = {
    accept: '.ipynb',
    beforeUpload: async (file) => {
      const isExisted = await instance.notebookFileService.isFileExisted(file.name);
      if (isExisted) {
        Modal.confirm({
          title: l10n.t('上传 Notebook'),
          centered: true,
          content: l10n.t('Notebook {name} 已经存在，是否覆盖它？', {
            name: file.name,
          }),
          okText: l10n.t('覆盖'),
          cancelText: l10n.t('取消'),
          okType: 'danger',
          async onOk(close) {
            await uploadFile(file);
            return close(Promise.resolve);
          },
        });
      } else {
        await uploadFile(file);
      }

      return false;
    },
    fileList: [],
  };

  return (
    <Space style={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip title={l10n.t('上传 Notebook')}>
        <span onClick={(e) => e.stopPropagation()}>
          <Upload {...props}>
            <UploadIcon size={14} />
          </Upload>
        </span>
      </Tooltip>
      <Tooltip title={l10n.t('新建 Notebook')}>
        <Plus
          size={14}
          onClick={(e) => {
            e.stopPropagation();
            instance.notebookFileService.addFile();
          }}
        />
      </Tooltip>
    </Space>
  );
};

@singleton()
@view('secretnote-notebook-extra-view')
export class ExtraView extends BaseView {
  view = ExtraComponent;
  readonly notebookFileService: NotebookFileService;

  constructor(@inject(NotebookFileService) notebookFileService: NotebookFileService) {
    super();
    this.notebookFileService = notebookFileService;
  }
}
