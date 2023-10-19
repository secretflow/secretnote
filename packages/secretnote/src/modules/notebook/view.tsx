import type { IContentsModel } from '@difizen/libro-jupyter';
import {
  BaseView,
  inject,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import type { InputRef } from 'antd';
import { Input, message, Modal, Popover } from 'antd';
import classnames from 'classnames';
import { ArrowRightFromLine, Copy, PenLine, Trash } from 'lucide-react';
import React from 'react';

import { DropdownMenu } from '@/components/dropdown-menu';
import { SideBarContribution } from '@/modules/layout';
import { ERROR_CODE, getErrorMessage } from '@/utils';

import './index.less';
import { NotebookFileService } from './service';

export const NotebookFileComponent = () => {
  const instance = useInject<NotebookFileView>(ViewInstance);
  const notebookFileService = instance.notebookFileService;
  const renameInputRef = React.useRef<InputRef>(null);

  const onMenuClick = (key: string, file: IContentsModel) => {
    switch (key) {
      case 'rename':
        notebookFileService.renameNotebookFile =
          notebookFileService.createRenameNoteBookFile(file);
        break;
      case 'delete':
        Modal.confirm({
          title: 'Delete Notebook?',
          centered: true,
          content: `The notebook ${notebookFileService.getFileNameWithoutExt(
            file.name,
          )} will be deleted.`,
          okText: 'Delete Notebook',
          cancelText: 'Cancel',
          okType: 'danger',
          async onOk(close) {
            await notebookFileService.deleteFile(file);
            message.success('Notebook deleted.');
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

  const renameFile = async () => {
    const code = await notebookFileService.renameFile();
    if (code !== ERROR_CODE.NO_ERROR) {
      message.error(getErrorMessage(code));
      notebookFileService.renameNotebookFile = null;
    }
  };

  return (
    <ul className="secretnote-notebook-list">
      {notebookFileService.notebookFileList.map((file) => (
        <Popover
          key={file.path}
          content={
            <Input
              ref={renameInputRef}
              value={notebookFileService.getFileNameWithoutExt(
                notebookFileService.renameNotebookFile?.name,
              )}
              onChange={(e) => {
                if (notebookFileService.renameNotebookFile) {
                  notebookFileService.renameNotebookFile.name =
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
          open={notebookFileService.renameNotebookFile?.path === file.path}
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
        >
          <li
            onClick={() => notebookFileService.openFile(file)}
            className={classnames({
              current: notebookFileService.currentNotebookFile?.path === file.path,
            })}
          >
            <span>{notebookFileService.getFileNameWithoutExt(file.name)}</span>
            <DropdownMenu
              items={[
                { key: 'rename', label: 'Rename', icon: <PenLine size={12} /> },
                { key: 'copy', label: 'Duplicate', icon: <Copy size={12} /> },
                {
                  key: 'export',
                  label: 'Export as .ipynb',
                  icon: <ArrowRightFromLine size={12} />,
                },
                { type: 'divider' },
                {
                  key: 'delete',
                  label: 'Delete',
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

  constructor(@inject(NotebookFileService) notebookFileService: NotebookFileService) {
    super();
    this.notebookFileService = notebookFileService;
    this.notebookFileService.getFileList();
  }
}
