import { l10n } from '@difizen/mana-l10n';
import type { Editor } from '@tiptap/core';
import { Popover } from 'antd';
import { Check, ChevronDown } from 'lucide-react';
import type { Dispatch, FC, SetStateAction } from 'react';
import './color-selector.less';
import React from 'react';

export interface BubbleColorMenuItem {
  name: string;
  color: string;
  label: string;
}

interface ColorSelectorProps {
  editor: Editor;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const TEXT_COLORS: BubbleColorMenuItem[] = [
  {
    name: 'Default',
    color: 'rgb(0 0 0)',
    label: l10n.t('默认'),
  },
  {
    name: 'Purple',
    color: '#9333EA',
    label: l10n.t('紫色'),
  },
  {
    name: 'Red',
    color: '#E00000',
    label: l10n.t('红色'),
  },
  {
    name: 'Yellow',
    color: '#EAB308',
    label: l10n.t('黄色'),
  },
  {
    name: 'Blue',
    color: '#2563EB',
    label: l10n.t('蓝色'),
  },
  {
    name: 'Green',
    color: '#008A00',
    label: l10n.t('绿色'),
  },
  {
    name: 'Orange',
    color: '#FFA500',
    label: l10n.t('橙色'),
  },
  {
    name: 'Pink',
    color: '#BA4081',
    label: l10n.t('粉色'),
  },
  {
    name: 'Gray',
    color: '#A8A29E',
    label: l10n.t('灰色'),
  },
];

const HIGHLIGHT_COLORS: BubbleColorMenuItem[] = [
  {
    name: 'Default',
    color: '#ffffff',
    label: l10n.t('默认'),
  },
  {
    name: 'Purple',
    color: '#f6f3f8',
    label: l10n.t('紫色'),
  },
  {
    name: 'Red',
    color: '#fdebeb',
    label: l10n.t('红色'),
  },
  {
    name: 'Yellow',
    color: '#fbf4a2',
    label: l10n.t('黄色'),
  },
  {
    name: 'Blue',
    color: '#c1ecf9',
    label: l10n.t('蓝色'),
  },
  {
    name: 'Green',
    color: '#acf79f',
    label: l10n.t('绿色'),
  },
  {
    name: 'Orange',
    color: '#faebdd',
    label: l10n.t('橙色'),
  },
  {
    name: 'Pink',
    color: '#faf1f5',
    label: l10n.t('粉色'),
  },
  {
    name: 'Gray',
    color: '#f1f1ef',
    label: l10n.t('灰色'),
  },
];

export const ColorSelector: FC<ColorSelectorProps> = ({
  editor,
  isOpen,
  setIsOpen,
}) => {
  const activeColorItem = TEXT_COLORS.find(({ color }) =>
    editor.isActive('textStyle', { color }),
  );
  const activeHighlightItem = HIGHLIGHT_COLORS.find(({ color }) =>
    editor.isActive('highlight', { color }),
  );

  return (
    <Popover
      open={isOpen}
      placement="bottom"
      getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
      overlayStyle={{
        padding: 0,
      }}
      content={
        <div className="color-selector-popover-content">
          <div className="color-selector-popover-content-title">Color</div>
          {TEXT_COLORS.map(({ name, color, label }, index) => (
            <button
              key={index}
              onClick={() => {
                editor.commands.unsetColor();
                name !== 'Default' &&
                  editor
                    .chain()
                    .focus()
                    .setColor(color || '')
                    .run();
                setIsOpen(false);
              }}
              className="color-selector-button"
              type="button"
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="color-selector-space " style={{ color }}>
                  A
                </div>
                <span>{label}</span>
              </div>
              {editor.isActive('textStyle', { color }) && (
                <Check className="color-selector-check" />
              )}
            </button>
          ))}

          <div className="color-selector-Bg">Background</div>

          {HIGHLIGHT_COLORS.map(({ name, color, label }, index) => (
            <button
              key={index}
              onClick={() => {
                editor.commands.unsetHighlight();
                name !== 'Default' && editor.commands.setHighlight({ color });
                setIsOpen(false);
              }}
              className="color-selector-button"
              type="button"
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  className="color-selector-space"
                  style={{ backgroundColor: color }}
                >
                  A
                </div>
                <span>{label}</span>
              </div>
              {editor.isActive('highlight', { color }) && (
                <Check className="color-selector-children-icon" />
              )}
            </button>
          ))}
        </div>
      }
    >
      <div
        className="color-selector-children"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <span
          className="color-selector-children-text"
          style={{
            color: activeColorItem?.color,
            backgroundColor: activeHighlightItem?.color,
          }}
        >
          A
        </span>
        <ChevronDown className="color-selector-children-icon" />
      </div>
    </Popover>
  );
};
