import {
  BaseView,
  inject,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
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
    message.success('Notebook uploaded.');
  };

  const props: UploadProps = {
    accept: '.ipynb',
    beforeUpload: async (file) => {
      const isExisted = await instance.notebookFileService.isFileExisted(file.name);
      if (isExisted) {
        Modal.confirm({
          title: 'Upload Notebook',
          centered: true,
          content: `The notebook ${file.name} is existed. Do you want to overwrite it?`,
          okText: 'Overwrite',
          cancelText: 'Cancel',
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
      <Tooltip title="Upload a new notebook">
        <span onClick={(e) => e.stopPropagation()}>
          <Upload {...props}>
            <UploadIcon size={14} />
          </Upload>
        </span>
      </Tooltip>
      <Tooltip title="Create a new notebook">
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
