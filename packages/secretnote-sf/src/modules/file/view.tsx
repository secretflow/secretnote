// Views about file (file tree, file operations, etc.) management.

import {
  BaseView,
  inject,
  singleton,
  Slot,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import type { TreeDataNode as DataNode, UploadProps } from 'antd';
import { message, Modal, Space, Tree, Upload } from 'antd';
import { noop } from 'lodash-es';
import {
  ChevronDown,
  ClipboardCopy,
  Download,
  File,
  FileText,
  Fullscreen,
  ScanText,
  ScrollText,
  Table,
  Trash,
  UploadIcon,
} from 'lucide-react';
import React, { useState } from 'react';

import BusySpin from '@/components/busy-spin';
import type { Menu } from '@/components/dropdown-menu';
import { DropdownMenu } from '@/components/dropdown-menu';
import { FilePreviewService, LEGAL_TABLE_EXTS } from '@/modules/file/preview';
import { FileService } from '@/modules/file/service';
import { SideBarContribution } from '@/modules/layout';
import { genericErrorHandler } from '@/utils';
import './index.less';

const { DirectoryTree } = Tree;

const IconMap: Record<string, React.ReactElement> = {
  csv: <Table size={16} />,
  log: <ScrollText size={16} />,
  txt: <FileText size={16} />,
  default: <File size={16} />,
};

export const FileComponent = () => {
  const instance = useInject<FileView>(ViewInstance);
  const { fileService, filePreviewService } = instance;
  const [isUploading, setIsUploading] = useState(false);

  const onMenuClick = (key: string, node: DataNode) => {
    switch (key) {
      case 'copy':
        fileService
          .copyPath(node)
          .then(() => message.success(l10n.t('路径已经复制到剪切板')))
          .catch(() => message.error(l10n.t('复制失败')));
        break;
      case 'delete':
        Modal.confirm({
          title: l10n.t('删除文件'),
          centered: true,
          content: l10n.t('文件 {name} 将被删除', {
            name: node.title as string,
          }),
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
      case 'previewAsText':
      case 'previewAsTable': {
        const {
          serverId = '',
          path = '',
          serverName,
        } = FileService.parseNodeKey(node.key as string);
        const as_ = ({ previewAsText: 'text', previewAsTable: 'table' } as const)[key];
        filePreviewService.preview(as_, serverId, path, serverName);
        break;
      }
      default:
        break;
    }
  };

  /**
   * Handle the upload file action.
   */
  const uploadFile = async (nodeData: DataNode, file: File) => {
    setIsUploading(true);
    try {
      await fileService.uploadFile(nodeData, file.name, file);
      await fileService.getFileTree();
      message.success(l10n.t('文件上传成功'));
    } catch (e) {
      genericErrorHandler(e);
    } finally {
      setIsUploading(false);
    }
  };

  const uploadRender = (nodeData: DataNode) => {
    const props: UploadProps = {
      beforeUpload: async (file) => {
        const isExisted = await fileService.isFileExisted(nodeData, file.name);
        if (isExisted) {
          Modal.confirm({
            title: l10n.t('上传文件'),
            centered: true,
            content: l10n.t('文件 {name} 已经存在，是否覆盖？', {
              name: file.name,
            }),
            okText: l10n.t('覆盖'),
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
      const ext = FileService.getFileExt(nodeData);
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
      {
        key: 'uploadFile',
        label: uploadRender(nodeData),
        icon: <UploadIcon size={12} />,
      },
    ];
    const previewAsText = {
      key: 'previewAsText',
      label: l10n.t('文本预览'),
      icon: <ScanText size={12} />,
    };
    const previewAsTable = {
      key: 'previewAsTable',
      label: l10n.t('表格预览'),
      icon: <Fullscreen size={12} />,
    };

    const dataMenuItems: Menu[] = [
      ...(LEGAL_TABLE_EXTS.includes(FileService.getFileExt(nodeData) ?? '')
        ? [previewAsText, previewAsTable]
        : [previewAsText]),
      {
        key: 'copy',
        label: l10n.t('复制路径到剪切板'),
        icon: <ClipboardCopy size={12} />,
      },
      { key: 'download', label: l10n.t('下载'), icon: <Download size={12} /> },
      { type: 'divider' },
      {
        key: 'delete',
        label: l10n.t('删除'),
        icon: <Trash size={12} />,
        danger: true,
      },
    ];

    return (
      <div className="ant-tree-title-content">
        <Space>
          {getFileIcon(nodeData)}
          <span>{nodeData.title as string}</span>
        </Space>
        <DropdownMenu
          icon={isUploading ? <BusySpin /> : void 0} // undefined fallbacks to default "..." icon
          items={isLeaf ? dataMenuItems : folderMenuItems}
          disabled={isUploading}
          onClick={(key) => {
            if (isUploading) {
              return;
            }
            onMenuClick(key, nodeData);
          }}
        />
      </div>
    );
  };

  return (
    <>
      {fileService.fileTree === null && <BusySpin />}
      {fileService.fileTree && (
        <DirectoryTree
          blockNode
          onSelect={noop}
          treeData={fileService.fileTree}
          className="secretnote-file-tree"
          switcherIcon={<ChevronDown size={12} />}
          icon={null}
          titleRender={titleRender}
        />
      )}
      <Slot name="secretnote-file-preview-view" />
    </>
  );
};

export const fileViewKey = 'file';
@singleton({ contrib: [SideBarContribution] })
@view('secretnote-file-view')
export class FileView extends BaseView implements SideBarContribution {
  readonly fileService: FileService;
  readonly filePreviewService: FilePreviewService;

  key = fileViewKey;
  label = l10n.t('文件');
  order = 2;
  defaultOpen = true;
  view = FileComponent;

  constructor(
    @inject(FileService) fileService: FileService,
    @inject(FilePreviewService) filePreviewService: FilePreviewService,
  ) {
    super();
    this.fileService = fileService;
    this.filePreviewService = filePreviewService;
    this.fileService.getFileTree();
  }
}
