import { l10n } from '@difizen/mana-l10n';
import type { Editor } from '@tiptap/core';
import { Popover } from 'antd';
import { Check, ChevronDown } from 'lucide-react';
import type { Dispatch, FC, SetStateAction } from 'react';
import './color-selector.less';

export interface BubbleColorMenuItem {
  name: string;
  color: string;
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
  },
  {
    name: 'Purple',
    color: '#9333EA',
  },
  {
    name: 'Red',
    color: '#E00000',
  },
  {
    name: 'Blue',
    color: '#2563EB',
  },
  {
    name: 'Green',
    color: '#008A00',
  },
  {
    name: 'Orange',
    color: '#FFA500',
  },
  {
    name: 'Pink',
    color: '#BA4081',
  },
  {
    name: 'Gray',
    color: '#A8A29E',
  },
];

const HIGHLIGHT_COLORS: BubbleColorMenuItem[] = [
  {
    name: 'Default',
    color: '#ffffff',
  },
  {
    name: 'Purple',
    color: '#f6f3f8',
  },
  {
    name: 'Red',
    color: '#fdebeb',
  },
  {
    name: 'Yellow',
    color: '#fbf4a2',
  },
  {
    name: 'Blue',
    color: '#c1ecf9',
  },
  {
    name: 'Green',
    color: '#acf79f',
  },
  {
    name: 'Orange',
    color: '#faebdd',
  },
  {
    name: 'Pink',
    color: '#faf1f5',
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
          <div className="color-selector-popover-content-title">{l10n.t('颜色')}</div>

          <div className="color-selector-buttons-container">
            {TEXT_COLORS.map(({ name, color }, index) => (
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
                <div className="color-selector-space" style={{ color }}>
                  A
                </div>
                {editor.isActive('textStyle', { color }) && (
                  <Check className="color-selector-check" />
                )}
              </button>
            ))}
          </div>

          <div className="color-selector-Bg">{l10n.t('背景色')}</div>

          <div className="color-selector-buttons-container">
            {HIGHLIGHT_COLORS.map(({ name, color }, index) => (
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
                <div
                  className="color-selector-space"
                  style={{ backgroundColor: color }}
                >
                  A
                </div>
                {editor.isActive('highlight', { color }) && (
                  <Check className="color-selector-children-icon" />
                )}
              </button>
            ))}
          </div>
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
