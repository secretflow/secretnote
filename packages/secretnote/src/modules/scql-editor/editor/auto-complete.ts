/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as _ from 'lodash';
import * as monaco from 'monaco-editor';
import type { IParseResult, IMatching } from 'syntax-parser';

import {
  onSuggestFieldGroup,
  onHoverFunctionName,
  onHoverTableField,
  onHoverTableName,
  onSuggestFunctionName,
  onSuggestTableFields,
  onSuggestTableNames,
} from './auto-complete-server';
import type { ITableInfo, ICompletionItem, ICursorInfo } from './sql-parser';
import { mysqlParser, reader } from './sql-parser';

const language = 'sql';
const triggerCharacters =
  ' $.:{}=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const parser = (
  model: monaco.editor.ITextModel,
  position: monaco.Position,
): IParseResult | null => {
  return mysqlParser(model.getValue(), model.getOffsetAt(position));
};

const getNoneSuggestions = () => {
  return {
    suggestions: [],
  };
};

const pipeKeywords = (keywords: IMatching[]): ICompletionItem[] => {
  return keywords
    .filter((matching) => {
      return matching.type === 'string';
    })
    .map((matching) => {
      const value = /[a-zA-Z]+/.test(matching.value.toString())
        ? _.upperCase(matching.value.toString())
        : matching.value.toString();
      return {
        label: value,
        insertText: value,
        documentation: 'documentation',
        detail: 'detail',
        kind: monaco.languages.CompletionItemKind.Keyword,
        sortText: `W${matching.value}`,
      };
    });
};

monaco.languages.registerCompletionItemProvider(language, {
  triggerCharacters,
  provideCompletionItems: (async (
    model: monaco.editor.ITextModel,
    position: monaco.Position,
  ) => {
    const parseResult = parser(model, position);

    if (!parseResult) {
      return getNoneSuggestions();
    }

    const cursorInfo = await reader.getCursorInfo(
      parseResult.ast,
      parseResult.cursorKeyPath,
    );

    const parserSuggestion = pipeKeywords(parseResult.nextMatchings);

    if (!cursorInfo) {
      return {
        suggestions: parserSuggestion,
      };
    }

    switch (cursorInfo.type) {
      case 'tableField':
        const cursorRootStatementFields = await reader.getFieldsFromStatement(
          parseResult.ast,
          parseResult.cursorKeyPath,
          onSuggestTableFields,
        );

        const groups = _.groupBy(
          cursorRootStatementFields.filter((cursorRootStatementField) => {
            return cursorRootStatementField.groupPickerName !== null;
          }),
          'groupPickerName',
        );

        const functionNames = await onSuggestFunctionName(cursorInfo.token.value);

        return {
          suggestions: cursorRootStatementFields
            .concat(parserSuggestion)
            .concat(functionNames)
            .concat(
              groups
                ? Object.keys(groups).map((groupName) => {
                    return onSuggestFieldGroup(groupName);
                  })
                : [],
            ),
        };
      case 'tableFieldAfterGroup':
        const cursorRootStatementFieldsAfter = await reader.getFieldsFromStatement(
          parseResult.ast,
          parseResult.cursorKeyPath,
          onSuggestTableFields,
        );

        return {
          suggestions: cursorRootStatementFieldsAfter
            .filter((cursorRootStatementField: any) => {
              return (
                cursorRootStatementField.groupPickerName ===
                (cursorInfo as ICursorInfo<{ groupName: string }>).groupName
              );
            })
            .concat(parserSuggestion),
        };
      case 'tableName':
        const tableNames = await onSuggestTableNames(
          cursorInfo as ICursorInfo<ITableInfo>,
        );

        return {
          suggestions: tableNames.concat(parserSuggestion),
        };
      case 'functionName':
        return {
          suggestions: onSuggestFunctionName(cursorInfo.token.value),
        };
      default:
        return {
          suggestions: parserSuggestion,
        };
    }
  }) as any,
});

monaco.languages.registerHoverProvider(language, {
  provideHover: async (model: monaco.editor.ITextModel, position: monaco.Position) => {
    const parseResult = parser(model, position);

    if (!parseResult) {
      return null;
    }

    const cursorInfo = await reader.getCursorInfo(
      parseResult.ast,
      parseResult.cursorKeyPath,
    );

    if (!cursorInfo) {
      return null;
    }

    let contents: monaco.IMarkdownString[] = [];

    switch (cursorInfo.type) {
      case 'tableField':
        const extra = await reader.findFieldExtraInfo(
          parseResult.ast,
          cursorInfo,
          onSuggestTableFields,
          parseResult.cursorKeyPath,
        );
        contents = await onHoverTableField(cursorInfo.token.value, extra);
        break;
      case 'tableFieldAfterGroup':
        const extraAfter = await reader.findFieldExtraInfo(
          parseResult.ast,
          cursorInfo,
          onSuggestTableFields,
          parseResult.cursorKeyPath,
        );
        contents = await onHoverTableField(cursorInfo.token.value, extraAfter);
        break;
      case 'tableName':
        contents = await onHoverTableName(cursorInfo as ICursorInfo);
        break;
      case 'functionName':
        contents = await onHoverFunctionName(cursorInfo.token.value);
        break;
      default:
    }

    return {
      range: monaco.Range.fromPositions(
        model.getPositionAt(cursorInfo.token.position![0]),
        model.getPositionAt(cursorInfo.token.position![1] + 1),
      ),
      contents,
    };
  },
});
