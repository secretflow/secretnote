// A WYSIWYG markdown editor component used as the Markdown Cell in SecretNote.
// The default markdown cell shipped with @difizen/libro-markdown-cell is not WYSIWYG,
// so we don't use it.

import type { Editor as EditorClass } from '@tiptap/core';
import type { Extension } from '@tiptap/react';
import { EditorContent, useEditor } from '@tiptap/react';
import { useDebounceFn } from 'ahooks';
import { useEffect, useState } from 'react';

import { EditorBubbleMenu } from './bubble-menu';
import { defaultExtensions } from './extensions';
import './index.less';
import { noop } from 'lodash-es';

export function Editor({
  defaultValue = '',
  extensions = [],
  onUpdate = noop,
  onDebouncedUpdate = noop,
}: {
  defaultValue: string;
  extensions?: Extension[];
  onUpdate?: (editor?: EditorClass) => void | Promise<void>;
  onDebouncedUpdate?: (editor?: EditorClass, content?: string) => void | Promise<void>;
}) {
  const [content, setContent] = useState<string>(defaultValue);
  const [hydrated, setHydrated] = useState(false);

  const { run: debouncedUpdates } = useDebounceFn(
    async ({ editor }) => {
      const markdown = editor.storage.markdown.getMarkdown();
      setContent(markdown);
      onDebouncedUpdate(editor, markdown);
    },
    { wait: 1000 },
  );

  const editor = useEditor({
    extensions: [...defaultExtensions, ...extensions],
    editorProps: {
      handleDOMEvents: {
        keydown: (_view, event) => {
          // prevent default event listeners from firing when slash command is active
          if (['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) {
            const slashCommand = document.querySelector('#slash-command');
            if (slashCommand) {
              return true;
            }
          }
        },
      },
    },
    onUpdate: (e) => {
      onUpdate(e.editor);
      debouncedUpdates(e);
    },
    autofocus: 'end',
  });

  // Hydrate the editor with the content from localStorage.
  useEffect(() => {
    if (editor && content && !hydrated) {
      editor.commands.setContent(content);
      setHydrated(true);
    }
  }, [editor, content, hydrated]);

  return (
    <div
      onClick={() => {
        editor?.chain().focus().run();
      }}
      className="markdown-editor"
    >
      {editor && <EditorBubbleMenu editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
