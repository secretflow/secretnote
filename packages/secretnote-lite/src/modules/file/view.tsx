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
import React from 'react';

import { DropdownMenu } from '@/components/dropdown-menu';
import type { Menu } from '@/components/dropdown-menu';
import { SideBarContribution } from '@/modules/layout';
import { readFile } from '@/utils';

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
        message.success(l10n.t('路径已经复制到剪切板'));
        break;
      case 'delete':
        Modal.confirm({
          title: l10n.t('删除文件'),
          centered: true,
          content: l10n.t('文件 {name} 将被删除', { name: node.title as string }),
          okText: l10n.t('删除文件'),
          cancelText: l10n.t('取消'),
          okType: 'danger',
          async onOk(close) {
            await fileService.deleteFile(node);
            message.success(l10n.t('文件已经删除'));
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
    try {
      await fileService.uploadFile(nodeData, file.name, content);
      await fileService.getFileTree();
      message.success(l10n.t('文件上传成功'));
    } catch (e) {
      if (e instanceof Error) {
        message.error(e.message);
      }
    }
  };

  const uploadRender = (nodeData: DataNode) => {
    const props: UploadProps = {
      accept: FILE_EXTS.join(','),
      beforeUpload: async (file) => {
        const isExisted = await fileService.isFileExist(nodeData, file.name);
        if (isExisted) {
          Modal.confirm({
            title: l10n.t('上传文件'),
            centered: true,
            content: l10n.t('文件 {name} 已经存在，是否覆盖？', { name: file.name }),
            okText: 'Overwrite',
            cancelText: l10n.t('取消'),
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
    return <Upload {...props}>{l10n.t('上传到文件夹')}</Upload>;
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
      // { key: 'view', label: l10n.t('查看'), icon: <Link size={12} /> },
      {
        key: 'copy',
        label: l10n.t('复制路径到剪切板'),
        icon: <ClipboardCopy size={12} />,
      },
      { key: 'download', label: l10n.t('下载'), icon: <Download size={12} /> },
      { type: 'divider' },
      { key: 'delete', label: l10n.t('删除'), icon: <Trash size={12} />, danger: true },
    ];

    return (
      <div className="ant-tree-title-content">
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
      onSelect={() => {
        // do nothing
      }}
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
  label = l10n.t('文件');
  order = 2;
  defaultOpen = true;
  view = FileComponent;

  constructor(@inject(FileService) fileService: FileService) {
    super();
    this.fileService = fileService;
    this.fileService.getFileTree();
  }
}
