import type {
  IEditor,
  IEditorOptions,
  IModel,
  IRange,
  IEditorConfig,
  IPosition,
  ICoordinate,
} from '@difizen/libro-jupyter';
import { Disposable, DisposableCollection, watch, Emitter } from '@difizen/mana-app';
import * as monaco from 'monaco-editor';
import { format } from 'sql-formatter';

import { uuid } from '@/utils';
import './index.less';

export type MonacoEditorType = monaco.editor.IStandaloneCodeEditor;

export class SQLEditor implements IEditor {
  private editorHost: HTMLElement;
  private _model: IModel;
  private _uuid = '';
  private _config: Partial<IEditorConfig>;
  private _isDisposed = false;

  protected toDispose = new DisposableCollection();
  protected oldDeltaDecorations: string[] = [];

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

  protected modalChangeEmitter = new Emitter<boolean>();
  get onModalChange() {
    return this.modalChangeEmitter.event;
  }

  constructor(options: IEditorOptions) {
    this.host = options.host;
    this._model = options.model;
    this._uuid = options.uuid || uuid();
    this._config = { ...options.config };

    this.host.classList.add('sql-editor-container');
    this.editorHost = document.createElement('div');
    this.host.append(this.editorHost);

    this.registerFormat();
    this.createEditor(this.editorHost);

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
  }

  protected registerFormat() {
    // define a document formatting provider
    // then you contextmenu will add an "Format Document" action
    monaco.languages.registerDocumentFormattingEditProvider('sql', {
      provideDocumentFormattingEdits(model) {
        const formatted = format(model.getValue());
        return [
          {
            range: model.getFullModelRange(),
            text: formatted,
          },
        ];
      },
    });

    // define a range formatting provider
    // select some codes and right click those codes
    // you contextmenu will have an "Format Selection" action
    monaco.languages.registerDocumentRangeFormattingEditProvider('sql', {
      provideDocumentRangeFormattingEdits(model, range) {
        const formatted = format(model.getValueInRange(range));
        return [
          {
            range: range,
            text: formatted,
          },
        ];
      },
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

  protected onSelectionChange() {
    this.setSelections(this.model.selections);
  }

  dispose() {
    if (this.disposed) {
      return;
    }
    this.toDispose.dispose();
    this._isDisposed = true;
  }
}
