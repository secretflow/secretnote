import { l10n } from '@difizen/mana-l10n';
import type { Editor } from '@tiptap/core';
import classnames from 'classnames';
import { Check, Trash } from 'lucide-react';
import type { Dispatch, FC, SetStateAction } from 'react';
import { useEffect, useRef } from 'react';
import { getUrlFromString } from '../util';
import './link-selector.less';

interface LinkSelectorProps {
  editor: Editor;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export const LinkSelector: FC<LinkSelectorProps> = ({ editor, isOpen, setIsOpen }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus on input by default
  useEffect(() => {
    inputRef.current && inputRef.current?.focus();
  });

  return (
    <div className="link-selector-content">
      <button
        type="button"
        className="link-selector-button"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <p className="link-selector-text-base">↗</p>
        <p
          className={classnames('link-selector-underline', {
            'link-selector-blue': editor.isActive('link'),
          })}
        >
          {l10n.t('链接')}
        </p>
      </button>
      {isOpen && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget[0] as HTMLInputElement;
            const url = getUrlFromString(input.value);
            url && editor.chain().focus().setLink({ href: url }).run();
            setIsOpen(false);
          }}
          className="link-selector-form"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder={l10n.t('粘贴链接')}
            className="link-selector-input"
            defaultValue={editor.getAttributes('link').href || ''}
          />
          {editor.getAttributes('link').href ? (
            <button
              type="button"
              className="buttonLink"
              onClick={() => {
                editor.chain().focus().unsetLink().run();
                setIsOpen(false);
              }}
            >
              <Trash className="trash" />
            </button>
          ) : (
            <button className="check">
              <Check className="trash" />
            </button>
          )}
        </form>
      )}
    </div>
  );
};
