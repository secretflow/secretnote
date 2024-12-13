import { l10n } from '@difizen/mana-l10n';
import type { Editor } from '@tiptap/core';
import { Popover } from 'antd';
import {
  Check,
  ChevronDown,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ListOrdered,
  TextIcon,
  TextQuote,
} from 'lucide-react';
import type { Dispatch, FC, SetStateAction } from 'react';

import type { BubbleMenuItem } from '.';
import './node-selector.less';

interface NodeSelectorProps {
  editor: Editor;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export const NodeSelector: FC<NodeSelectorProps> = ({ editor, isOpen, setIsOpen }) => {
  const items: BubbleMenuItem[] = [
    {
      name: 'Text',
      label: l10n.t('正文'),
      icon: TextIcon,
      command: () => editor.chain().focus().toggleNode('paragraph', 'paragraph').run(),
      // I feel like there has to be a more efficient way to do this – feel free to PR if you know how!
      isActive: () =>
        editor.isActive('paragraph') &&
        !editor.isActive('bulletList') &&
        !editor.isActive('orderedList'),
    },
    {
      name: 'Heading 1',
      label: l10n.t('标题 1'),
      icon: Heading1,
      command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive('heading', { level: 1 }),
    },
    {
      name: 'Heading 2',
      label: l10n.t('标题 2'),
      icon: Heading2,
      command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 }),
    },
    {
      name: 'Heading 3',
      label: l10n.t('标题 3'),
      icon: Heading3,
      command: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor.isActive('heading', { level: 3 }),
    },
    {
      name: 'Bullet List',
      label: l10n.t('无序列表'),
      icon: ListOrdered,
      command: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
    },
    {
      name: 'Numbered List',
      label: l10n.t('有序列表'),
      icon: ListOrdered,
      command: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList'),
    },
    {
      name: 'Quote',
      label: l10n.t('引用'),
      icon: TextQuote,
      command: () =>
        editor
          .chain()
          .focus()
          .toggleNode('paragraph', 'paragraph')
          .toggleBlockquote()
          .run(),
      isActive: () => editor.isActive('blockquote'),
    },
    {
      name: 'Code',
      label: l10n.t('代码块'),
      icon: Code,
      command: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor.isActive('codeBlock'),
    },
  ];

  const activeItem = items.filter((item) => item.isActive()).pop() ?? {
    name: 'Multiple',
    label: l10n.t('多个'),
  };

  return (
    <Popover
      open={isOpen}
      overlayStyle={{
        padding: 0,
      }}
      getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
      placement="bottom"
      content={
        <div className="node-selector-content">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.command();
                setIsOpen(false);
              }}
              className="node-selector-button-Item"
              type="button"
            >
              <div className="node-selector-item">
                <div className="node-selector-item-contentIcon">
                  <item.icon className="node-selector-item-Icon" />
                </div>
                <span>{item.label}</span>
              </div>
              {activeItem.name === item.name && (
                <Check className="node-selector-textIcon" />
              )}
            </button>
          ))}
        </div>
      }
    >
      <div
        className="node-selector-text"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <span>{activeItem?.label}</span>
        <ChevronDown className="node-selector-textIcon" />
      </div>
    </Popover>
  );
};
