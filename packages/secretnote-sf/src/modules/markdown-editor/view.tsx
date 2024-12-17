import type { CellCollapsible } from '@difizen/libro-jupyter';
import { LibroEditorCellView } from '@difizen/libro-jupyter';
import { prop, transient, useInject, view, ViewInstance } from '@difizen/mana-app';
import { forwardRef } from 'react';

import { Editor } from '@/components/markdown-editor';

import './index.less';
import type { MarkdownCellModel } from './model';

export const MarkdownCell = forwardRef<HTMLDivElement>((props, ref) => {
  const instance = useInject<MarkdownCellView>(ViewInstance);

  return (
    <div
      ref={ref}
      onFocus={() => {
        instance.focus(true);
      }}
      onBlur={(e) => {
        if (typeof ref !== 'function' && !ref?.current?.contains(e.relatedTarget)) {
          instance.blur();
        }
      }}
      className="markdown-cell"
    >
      <Editor
        defaultValue={instance.cellModel.value}
        onDebouncedUpdate={(editor, content) => {
          instance.cellModel.value = content || '';
        }}
      />
    </div>
  );
});
MarkdownCell.displayName = 'MarkdownCell';

@transient()
@view('markdown-cell-view')
export class MarkdownCellView extends LibroEditorCellView implements CellCollapsible {
  view = MarkdownCell;

  @prop() headingCollapsed = false;
  @prop() collapsibleChildNumber = 0;

  get cellModel() {
    return this.model as MarkdownCellModel;
  }

  get wrapperCls() {
    return 'secretnote-markdown-cell';
  }

  focus = (toEdit: boolean) => {
    if (toEdit) {
      this.cellModel.isEdit = true;
    }
  };

  blur = () => {
    this.cellModel.isEdit = false;
  };

  shouldEnterEditorMode() {
    return this.cellModel.isEdit;
  }

  getSelectionsOffsetAt = () => {
    return { start: 0, end: 0 };
  };

  getSelections = () => {
    return [];
  };
}
