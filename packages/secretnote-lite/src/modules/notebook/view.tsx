// This is the "Notebooks" part of the sidebar on the left.

import type { IContentsModel } from '@difizen/libro-jupyter';
import {
  BaseView,
  inject,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import type { InputRef } from 'antd';
import { Input, message, Modal, Popover } from 'antd';
import classnames from 'classnames';
import { ArrowRightFromLine, Copy, PenLine, Trash } from 'lucide-react';
import React from 'react';

import { DropdownMenu } from '@/components/dropdown-menu';
import { SideBarContribution } from '@/modules/layout';

import { genericErrorHandler } from '@/utils';
import './index.less';
import { NotebookFileService } from './service';

export const NotebookFileComponent = () => {
  const instance = useInject<NotebookFileView>(ViewInstance);
  const notebookFileService = instance.notebookFileService;
  const renameInputRef = React.useRef<InputRef>(null);

  const onMenuClick = (key: string, file: IContentsModel) => {
    switch (key) {
      case 'rename':
        // pend a rename action
        notebookFileService.pendRenameAction(file);
        break;
      case 'delete':
        Modal.confirm({
          title: l10n.t('删除 Notebook'),
          centered: true,
          content: l10n.t('Notebook {name} 将被删除', {
            name: notebookFileService.getFileNameWithoutExt(file.name),
          }),
          okText: l10n.t('删除 Notebook'),
          cancelText: l10n.t('取消'),
          okType: 'danger',
          async onOk(close) {
            await notebookFileService.deleteFile(file);
            message.success(l10n.t('Notebook 删除成功'));
            return close(Promise.resolve);
          },
        });
        break;
      case 'export':
        notebookFileService.exportFile(file);
        break;
      case 'copy':
        notebookFileService.copyFile(file);
        break;
      default:
        break;
    }
  };

  /**
   * Commit the rename action.
   */
  const renameFile = async () => {
    try {
      await notebookFileService.renameFile();
    } catch (e) {
      genericErrorHandler(e);
      if (e instanceof Error) {
        notebookFileService.pendingRename = null;
      }
    }
  };

  return (
    <ul className="secretnote-notebook-list">
      {notebookFileService.notebookFileList.map((file) => (
        <Popover
          title={l10n.t('新文件名')}
          key={file.path}
          content={
            <Input
              ref={renameInputRef}
              value={notebookFileService.getFileNameWithoutExt(
                notebookFileService.pendingRename?.name,
              )}
              onChange={(e) => {
                if (notebookFileService.pendingRename) {
                  notebookFileService.pendingRename.name =
                    notebookFileService.getFileNameWithExt(e.target.value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  renameFile();
                }
              }}
            />
          }
          open={notebookFileService.pendingRename?.path === file.path}
          placement="right"
          overlayClassName="secretnote-notebook-list-popover"
          trigger={['click']}
          afterOpenChange={(open) => {
            if (open) {
              renameInputRef.current?.select();
            }
          }}
          onOpenChange={(open) => {
            if (!open) {
              renameFile();
            }
          }}
          arrow={false}
        >
          <li
            onClick={() => notebookFileService.openFile(file)}
            className={classnames({
              current:
                notebookFileService.currentNotebookFile?.path === file.path,
            })}
          >
            <span>{notebookFileService.getFileNameWithoutExt(file.name)}</span>
            <DropdownMenu
              items={[
                {
                  key: 'rename',
                  label: l10n.t('重命名'),
                  icon: <PenLine size={12} />,
                },
                {
                  key: 'copy',
                  label: l10n.t('复制'),
                  icon: <Copy size={12} />,
                },
                {
                  key: 'export',
                  label: l10n.t('导出为 .ipynb 文件'),
                  icon: <ArrowRightFromLine size={12} />,
                },
                { type: 'divider' },
                {
                  key: 'delete',
                  label: l10n.t('删除'),
                  icon: <Trash size={12} />,
                  danger: true,
                },
              ]}
              onClick={(key) => {
                onMenuClick(key, file);
              }}
            />
          </li>
        </Popover>
      ))}
    </ul>
  );
};

export const notebookFileViewKey = 'notebook';
@singleton({ contrib: [SideBarContribution] })
@view('secretnote-notebook-view')
export class NotebookFileView extends BaseView implements SideBarContribution {
  key = notebookFileViewKey;
  label = 'Notebooks';
  order = 1;
  defaultOpen = true;

  view = NotebookFileComponent;
  readonly notebookFileService: NotebookFileService;

  constructor(
    @inject(NotebookFileService) notebookFileService: NotebookFileService,
  ) {
    super();
    this.notebookFileService = notebookFileService;
    this.notebookFileService.getFileList();
  }
}
