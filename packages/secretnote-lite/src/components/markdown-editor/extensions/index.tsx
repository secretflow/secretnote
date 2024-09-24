import { l10n } from '@difizen/mana-l10n';
import { InputRule } from '@tiptap/core';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import TiptapLink from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TaskItem } from '@tiptap/extension-task-item';
import { TaskList } from '@tiptap/extension-task-list';
import { TextStyle } from '@tiptap/extension-text-style';
import TiptapUnderline from '@tiptap/extension-underline';
import { StarterKit } from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import SlashCommand from './slash-command';
import { MathExtension } from '@aarkue/tiptap-math-extension';

export const defaultExtensions = [
  StarterKit.configure({
    bulletList: {
      HTMLAttributes: {
        class: 'bullet-list',
      },
    },
    orderedList: {
      HTMLAttributes: {
        class: 'order-list',
      },
    },
    listItem: {
      HTMLAttributes: {
        class: 'list-item',
      },
    },
    blockquote: {
      HTMLAttributes: {
        class: 'blockquote',
      },
    },
    codeBlock: {
      HTMLAttributes: {
        class: 'code-block',
      },
    },
    code: {
      HTMLAttributes: {
        class: 'code',
        spellcheck: 'false',
      },
    },
    horizontalRule: false,
    dropcursor: {
      color: '#DBEAFE',
      width: 4,
    },
    gapcursor: false,
  }),
  // patch to fix horizontal rule bug: https://github.com/ueberdosis/tiptap/pull/3859#issuecomment-1536799740
  HorizontalRule.extend({
    addInputRules() {
      return [
        new InputRule({
          find: /^(?:---|—-|___\s|\*\*\*\s)$/,
          handler: ({ state, range }) => {
            const attributes = {};

            const { tr } = state;
            const start = range.from;
            const end = range.to;

            tr.insert(start - 1, this.type.create(attributes)).delete(
              tr.mapping.map(start),
              tr.mapping.map(end),
            );
          },
        }),
      ];
    },
  }).configure({
    HTMLAttributes: {
      class: 'horizontal',
    },
  }),
  TiptapLink.configure({
    HTMLAttributes: {
      class: 'link-text',
    },
  }),
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === 'heading') {
        return `标题 ${node.attrs.level}`;
      }
      return l10n.t('键入 / 查看更多命令');
    },
    includeChildren: true,
  }),
  SlashCommand,
  TiptapUnderline,
  TextStyle,
  Color,
  Highlight.configure({
    multicolor: true,
  }),
  TaskList.configure({
    HTMLAttributes: {
      class: 'task-list',
    },
  }),
  TaskItem.configure({
    HTMLAttributes: {
      class: 'task-list-item',
    },
    nested: true,
  }),
  Markdown.configure({
    html: true,
    transformCopiedText: true,
  }),
  MathExtension,
];
