import {
  BaseView,
  inject,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import type { UploadProps } from 'antd';
import { message, Modal, Space, Tree, Upload } from 'antd';
import type { DataNode } from 'antd/es/tree';
import {
  ChevronDown,
  ClipboardCopy,
  Download,
  File,
  FileText,
  Link,
  ScrollText,
  Table,
  Trash,
  Upload as UploadIcon,
} from 'lucide-react';

import { DropdownMenu } from '@/components/dropdown-menu';
import type { Menu } from '@/components/dropdown-menu';
import { SideBarContribution } from '@/modules/layout';
import { ERROR_CODE, getErrorMessage, readFile } from '@/utils';

import './index.less';
import { FileService, FILE_EXTS } from './service';

const { DirectoryTree } = Tree;

const IconMap: Record<string, React.ReactElement> = {
  csv: <Table size={16} />,
  log: <ScrollText size={16} />,
  txt: <FileText size={16} />,
  default: <File size={16} />,
};

export const FileComponent = () => {
  const instance = useInject<FileView>(ViewInstance);
  const fileService = instance.fileService;

  const onMenuClick = (key: string, node: DataNode) => {
    switch (key) {
      case 'copy':
        fileService.copyPath(node);
        message.success('Path copied to clipboard.');
        break;
      case 'delete':
        Modal.confirm({
          title: 'Delete File?',
          centered: true,
          content: `The file ${node.title} will be deleted.`,
          okText: 'Delete File',
          cancelText: 'Cancel',
          okType: 'danger',
          async onOk(close) {
            await fileService.deleteFile(node);
            message.success('File deleted.');
            return close(Promise.resolve);
          },
        });
        break;
      case 'download':
        fileService.downloadFile(node);
        break;
      case 'view':
        fileService.viewFile(node);
        break;
      default:
        break;
    }
  };

  const uploadFile = async (nodeData: DataNode, file: File) => {
    const content = await readFile(file);
    const code = await fileService.uploadFile(nodeData, file.name, content);
    if (code !== ERROR_CODE.NO_ERROR) {
      message.error(getErrorMessage(code));
    } else {
      await fileService.getFileTree();
      message.success('File uploaded.');
    }
  };

  const uploadRender = (nodeData: DataNode) => {
    const props: UploadProps = {
      accept: FILE_EXTS.join(','),
      beforeUpload: async (file) => {
        const isExisted = await fileService.isFileExist(nodeData, file.name);
        if (isExisted) {
          Modal.confirm({
            title: 'Upload File',
            centered: true,
            content: `The file ${file.name} is existed. Do you want to overwrite it?`,
            okText: 'Overwrite',
            cancelText: 'Cancel',
            okType: 'danger',
            async onOk(close) {
              await uploadFile(nodeData, file);
              return close(Promise.resolve);
            },
          });
        } else {
          uploadFile(nodeData, file);
        }

        return false;
      },
      fileList: [],
    };
    return <Upload {...props}>Upload to folder</Upload>;
  };

  const getFileIcon = (nodeData: DataNode) => {
    const isLeaf = nodeData.isLeaf;
    if (isLeaf) {
      const ext = fileService.getFileExt(nodeData);
      if (ext && ext in IconMap) {
        return IconMap[ext];
      }
      return IconMap.default;
    }
    return null;
  };

  const titleRender = (nodeData: DataNode) => {
    const isLeaf = nodeData.isLeaf;

    const folderMenuItems: Menu[] = [
      { key: 'upload', label: uploadRender(nodeData), icon: <UploadIcon size={12} /> },
    ];
    const dataMenuItems: Menu[] = [
      { key: 'view', label: 'View', icon: <Link size={12} /> },
      {
        key: 'copy',
        label: 'Copy path to clipboard',
        icon: <ClipboardCopy size={12} />,
      },
      { key: 'download', label: 'Download', icon: <Download size={12} /> },
      { type: 'divider' },
      { key: 'delete', label: 'Delete', icon: <Trash size={12} />, danger: true },
    ];

    return (
      <div className="secretnote-tree-title">
        <span>
          <Space>
            {getFileIcon(nodeData)}
            <span>{nodeData.title as string}</span>
          </Space>
        </span>
        <DropdownMenu
          items={isLeaf ? dataMenuItems : folderMenuItems}
          onClick={(key) => {
            onMenuClick(key, nodeData);
          }}
        />
      </div>
    );
  };

  return (
    <DirectoryTree
      blockNode
      treeData={fileService.fileTree}
      className="secretnote-file-tree"
      switcherIcon={<ChevronDown size={12} />}
      icon={null}
      titleRender={titleRender}
    />
  );
};

export const fileViewKey = 'file';
@singleton({ contrib: [SideBarContribution] })
@view('secretnote-file-view')
export class FileView extends BaseView implements SideBarContribution {
  readonly fileService: FileService;

  key = fileViewKey;
  label = 'Files';
  order = 2;
  defaultOpen = true;
  view = FileComponent;

  constructor(@inject(FileService) fileService: FileService) {
    super();
    this.fileService = fileService;
    this.fileService.getFileTree();
  }
}
