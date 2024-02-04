/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type {
  IEditor,
  IEditorOptions,
  IModel,
  IRange,
  IEditorConfig,
  IPosition,
  ICoordinate,
  SearchMatch,
} from '@difizen/libro-jupyter';
import {
  Disposable,
  DisposableCollection,
  watch,
  Emitter,
  Deferred,
} from '@difizen/mana-app';
import * as monaco from 'monaco-editor';
import type { IMatching } from 'syntax-parser';

import { uuid } from '@/utils';

import { parser } from './auto-complete';
import './format';

import './index.less';

export type MonacoEditorType = monaco.editor.IStandaloneCodeEditor;
export type MonacoMatch = monaco.editor.FindMatch;

export class SQLEditor implements IEditor {
  protected editorReadyDeferred = new Deferred<void>();
  editorReady = this.editorReadyDeferred.promise;
  private editorHost: HTMLElement;
  private _model: IModel;
  private _uuid = '';
  private _config: Partial<IEditorConfig>;
  private _isDisposed = false;

  protected toDispose = new DisposableCollection();
  protected oldDeltaDecorations: string[] = [];
  protected modalChangeEmitter = new Emitter<boolean>();

  monacoEditor?: MonacoEditorType;
  host: HTMLElement;

  get uuid(): string {
    return this._uuid;
  }

  set uuid(value: string) {
    this._uuid = value;
  }

  get model(): IModel {
    return this._model;
  }

  get config(): Partial<IEditorConfig> {
    return this._config;
  }

  get lineCount(): number {
    return this.monacoEditor?.getModel()?.getLineCount() || 0;
  }

  get disposed(): boolean {
    return this._isDisposed;
  }

  get onModalChange() {
    return this.modalChangeEmitter.event;
  }

  constructor(options: IEditorOptions) {
    this.host = options.host;
    this._model = options.model;
    this._uuid = options.uuid || uuid();
    this._config = { ...options.config };

    this.editorHost = document.createElement('div');
    //this.editorHost.classList.add('sql-editor-container');
    this.host.append(this.editorHost);

    this.createEditor(this.editorHost);

    this.checkSyntaxError();

    this.toDispose.push(watch(this._model, 'selections', this.onSelectionChange));
  }

  protected async createEditor(host: HTMLElement) {
    this.monacoEditor = monaco.editor.create(host, {
      value: this.model.value,
      language: 'sql',
      ...this.toMonacoOptions(this._config),
    });

    this.toDispose.push(
      this.monacoEditor?.onDidChangeModelContent(() => {
        const value = this.monacoEditor?.getValue();
        if (value) {
          this.model.value = value;
          this.updateEditorSize();
        }
      }) ?? Disposable.NONE,
    );
    this.toDispose.push(
      this.monacoEditor?.onDidContentSizeChange(() => {
        this.updateEditorSize();
      }) ?? Disposable.NONE,
    );
    this.toDispose.push(
      this.monacoEditor?.onDidBlurEditorText(() => {
        this.blur();
      }) ?? Disposable.NONE,
    );

    this.updateEditorSize();
    this.editorReadyDeferred.resolve();
  }

  protected checkSyntaxError() {
    this.monacoEditor?.onDidChangeModelContent(() => {
      const model = this.monacoEditor?.getModel();
      const position = this.monacoEditor?.getPosition();

      if (!model || !position) {
        return;
      }

      const parseResult = parser(model, position);
      if (!parseResult) {
        return;
      }

      if (parseResult.error) {
        const newReason =
          parseResult.error.reason === 'incomplete'
            ? `Incomplete, expect next input: \n${parseResult.error.suggestions
                .map((each: IMatching) => {
                  return each.value;
                })
                .join('\n')}`
            : `Wrong input, expect: \n${parseResult.error.suggestions
                .map((each: IMatching) => {
                  return each.value;
                })
                .join('\n')}`;

        const errorPosition = parseResult.error.token
          ? {
              startLineNumber: model.getPositionAt(parseResult.error.token.position![0])
                .lineNumber,
              startColumn: model.getPositionAt(parseResult.error.token.position![0])
                .column,
              endLineNumber: model.getPositionAt(parseResult.error.token.position![1])
                .lineNumber,
              endColumn:
                model.getPositionAt(parseResult.error.token.position![1]).column + 1,
            }
          : {
              startLineNumber: 0,
              startColumn: 0,
              endLineNumber: 0,
              endColumn: 0,
            };

        // model.getPositionAt(parseResult.error.token);

        monaco.editor.setModelMarkers(model, 'sql', [
          {
            ...errorPosition,
            message: newReason,
            severity: monaco.MarkerSeverity.Error,
          },
        ]);
      } else {
        monaco.editor.setModelMarkers(model, 'sql', []);
      }
    });
  }

  protected toMonacoOptions(
    config: Partial<IEditorConfig>,
  ): monaco.editor.IStandaloneEditorConstructionOptions {
    return {
      minimap: {
        enabled: false,
      },
      lineHeight: config.lineHeight ?? 20,
      fontSize: config.fontSize ?? 13,
      lineNumbers: config.lineNumbers ? 'on' : 'off',
      folding: config.codeFolding ?? true,
      wordWrap: config.lineWrap ?? 'off',
      lineDecorationsWidth: 15,
      lineNumbersMinChars: 3,
      suggestSelection: 'first',
      wordBasedSuggestions: 'currentDocument',
      scrollBeyondLastLine: false,
      fixedOverflowWidgets: true,
      suggest: { snippetsPreventQuickSuggestions: false },
      autoClosingQuotes: config.autoClosingBrackets ? 'always' : 'never',
      autoDetectHighContrast: false,
      scrollbar: {
        alwaysConsumeMouseWheel: false,
        verticalScrollbarSize: 0,
      },
      extraEditorClassName: 'sql-editor',
      renderLineHighlight: 'all',
      renderLineHighlightOnlyWhenFocus: true,
      readOnly: config.readOnly,
      cursorWidth: 1,
      tabSize: config.tabSize ?? 4,
      insertSpaces: config.insertSpaces ?? true,
      matchBrackets: config.matchBrackets ? 'always' : 'never',
      rulers: config.rulers ?? [],
      wordWrapColumn: config.wordWrapColumn || 80,
    };
  }

  protected updateEditorSize() {
    const contentHeight = this.monacoEditor?.getContentHeight() ?? 20;
    this.host.style.height = `${contentHeight + 30}px`;
    try {
      this.monacoEditor?.layout({
        width: this.host.offsetWidth,
        height: contentHeight,
      });
    } catch (e) {
      //pass
    }
  }

  protected toMonacoRange(range: IRange) {
    const selection = range ?? this.getSelection();
    const monacoSelection = {
      startLineNumber: selection.start.line || 1,
      startColumn: selection.start.column || 1,
      endLineNumber: selection.end.line || 1,
      endColumn: selection.end.column || 1,
    };
    return monacoSelection;
  }

  protected onSelectionChange() {
    this.setSelections(this.model.selections);
  }

  protected toMonacoMatch(match: SearchMatch): MonacoMatch {
    const start = this.getPositionAt(match.position);
    const end = this.getPositionAt(match.position + match.text.length);
    return {
      range: new monaco.Range(
        start?.line ?? 1,
        start?.column ?? 1,
        end?.line ?? 1,
        end?.column ?? 1,
      ),
      matches: [match.text],
      _findMatchBrand: undefined,
    };
  }

  setOption = <K extends keyof IEditorConfig>(option: K, value: IEditorConfig[K]) => {
    if (value === null || value === undefined) {
      return;
    }

    const sizeKeys = [
      'fontFamily',
      'fontSize',
      'lineHeight',
      'wordWrapColumn',
      'lineWrap',
    ];
    const monacoOptionkeys = sizeKeys.concat(['readOnly', 'insertSpaces', 'tabSize']);

    if (monacoOptionkeys.includes(option)) {
      this._config = { ...this._config, [option]: value };

      this.monacoEditor?.updateOptions(this.toMonacoOptions(this._config));
    }

    if (sizeKeys.includes(option)) {
      this.updateEditorSize();
    }
  };

  getOption<K extends keyof IEditorConfig>(option: K) {
    return this._config[option] as IEditorConfig[K];
  }

  getLine = (line: number) => {
    return this.monacoEditor?.getModel()?.getLineContent(line);
  };

  getOffsetAt = (position: IPosition) => {
    return (
      this.monacoEditor
        ?.getModel()
        ?.getOffsetAt({ lineNumber: position.line, column: position.column }) || 0
    );
  };

  undo = () => {
    this.monacoEditor?.trigger('source', 'undo', {});
  };

  redo = () => {
    this.monacoEditor?.trigger('source', 'redo', {});
  };

  focus = () => {
    this.monacoEditor?.focus();
  };

  hasFocus = () => {
    return this.monacoEditor?.hasWidgetFocus() ?? false;
  };

  blur = () => {
    document.documentElement.focus();
  };

  resizeToFit = () => {
    this.monacoEditor?.layout();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getPositionForCoordinate = (coordinate: ICoordinate) => {
    return null;
  };

  getCursorPosition = () => {
    const position: IPosition = {
      line: this.monacoEditor?.getPosition()?.lineNumber || 1,
      column: this.monacoEditor?.getPosition()?.column || 1,
    };

    return position;
  };

  setCursorPosition = (position: IPosition) => {
    this.monacoEditor?.setPosition({
      column: position.column,
      lineNumber: position.line,
    });
  };

  getSelection = () => {
    const selection = {
      start: {
        line: this.monacoEditor?.getSelection()?.startLineNumber || 1,
        column: this.monacoEditor?.getSelection()?.startColumn || 1,
      } as IPosition,
      end: {
        line: this.monacoEditor?.getSelection()?.endLineNumber || 1,
        column: this.monacoEditor?.getSelection()?.endColumn || 1,
      } as IPosition,
    };
    return selection;
  };

  setSelection = (selection: IRange) => {
    this.monacoEditor?.setSelection(this.toMonacoRange(selection));
  };

  getSelections = () => {
    const selections: IRange[] = [];
    this.monacoEditor?.getSelections()?.map((selection) =>
      selections.push({
        start: {
          line: selection.startLineNumber || 1,
          column: selection.startColumn || 1,
        } as IPosition,
        end: {
          line: selection.endLineNumber || 1,
          column: selection.endColumn || 1,
        } as IPosition,
      }),
    );
    return selections;
  };

  setSelections = (selections: IRange[]) => {
    this.monacoEditor?.setSelections(
      selections.map<monaco.ISelection>(
        (item) =>
          new monaco.Selection(
            item.start.line,
            item.start.column,
            item.end.line,
            item.end.column,
          ),
      ),
    );
  };

  revealSelection = (selection: IRange) => {
    this.monacoEditor?.revealRange(this.toMonacoRange(selection));
  };

  getSelectionValue = (range?: IRange | undefined) => {
    const selection = range ?? this.getSelection();
    return this.monacoEditor
      ?.getModel()
      ?.getValueInRange(this.toMonacoRange(selection));
  };

  replaceSelection = (text: string, range: IRange) => {
    this.monacoEditor?.executeEdits(undefined, [
      {
        range: this.toMonacoRange(range),
        text,
      },
    ]);
    this.monacoEditor?.pushUndoStop();
  };

  replaceSelections = (edits: { text: string; range: IRange }[]) => {
    this.monacoEditor?.executeEdits(
      undefined,
      edits.map((item) => ({ range: this.toMonacoRange(item.range), text: item.text })),
    );
    this.monacoEditor?.pushUndoStop();
  };

  getPositionAt = (offset: number): IPosition | undefined => {
    const position = this.monacoEditor?.getModel()?.getPositionAt(offset);
    return position ? { line: position.lineNumber, column: position.column } : position;
  };

  highlightMatches = (matches: SearchMatch[], currentIndex: number | undefined) => {
    let currentMatch: SearchMatch | undefined;
    const _matches = matches
      .map((item, index) => {
        if (index === currentIndex) {
          currentMatch = item;
          return {
            range: item,
            options: {
              className: `currentFindMatch`, // 当前高亮
            },
          };
        }
        return {
          range: item,
          options: {
            className: `findMatch`, // 匹配高亮
          },
        };
      })
      .map((item) => ({
        ...item,
        range: this.toMonacoMatch(item.range).range,
      }));
    this.oldDeltaDecorations =
      this.monacoEditor?.deltaDecorations(this.oldDeltaDecorations, _matches) || [];
    if (currentMatch) {
      const start = this.getPositionAt(currentMatch.position);
      const end = this.getPositionAt(currentMatch.position + currentMatch.text.length);
      if (start && end) {
        this.revealSelection({ end, start });
      }
    }
  };

  dispose() {
    if (this.disposed) {
      return;
    }
    this.toDispose.dispose();
    this._isDisposed = true;
  }
}
