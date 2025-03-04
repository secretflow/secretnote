import type {
  CellViewOptions,
  CodeEditorViewOptions,
  ExecutionMeta,
  IOutput,
  IOutputAreaOption,
  KernelMessage,
  LibroOutputArea,
} from '@difizen/libro-jupyter';
import {
  CellEditorMemo,
  CellService,
  CodeEditorView,
  isOutput,
  LibroExecutableCellView,
  NotebookCommands,
} from '@difizen/libro-jupyter';
import {
  CommandRegistry,
  inject,
  prop,
  transient,
  useInject,
  view,
  ViewInstance,
  ViewManager,
  ViewOption,
} from '@difizen/mana-app';
import { forwardRef } from 'react';

import { SQLEditor } from '../editor';
import { SqlOutputArea } from '../output';
import { QueryService } from '../service';

import type { SQLCellModel } from './model';

export const SqlCellComponent = forwardRef<HTMLDivElement>((props, ref) => {
  const instance = useInject<SQLCellView>(ViewInstance);

  return (
    <div
      tabIndex={10}
      ref={ref}
      className={instance.className}
      onFocus={() => {
        instance.focus(true);
      }}
      onBlur={(e) => {
        if (typeof ref !== 'function' && !ref?.current?.contains(e.relatedTarget)) {
          instance.blur();
        }
      }}
    >
      <CellEditorMemo />
    </div>
  );
});
SqlCellComponent.displayName = 'SqlCellComponent';

@transient()
@view('sql-cell-view')
export class SQLCellView extends LibroExecutableCellView {
  override view = SqlCellComponent;
  readonly queryService: QueryService;
  readonly viewManager: ViewManager;
  readonly commandRegistry: CommandRegistry;

  @prop() outputs: IOutput[] = [];
  @prop() editorView?: CodeEditorView = void 0;

  get cellModel() {
    return this.model as unknown as SQLCellModel;
  }

  constructor(
    @inject(ViewOption) options: CellViewOptions,
    @inject(CellService) cellService: CellService,
    @inject(ViewManager) viewManager: ViewManager,
    @inject(QueryService) queryService: QueryService,
    @inject(CommandRegistry) commandRegistry: CommandRegistry,
  ) {
    super(options, cellService);
    this.options = options;
    this.queryService = queryService;
    this.viewManager = viewManager;
    this.commandRegistry = commandRegistry;

    this.outputs = (options.cell?.outputs || []) as IOutput[];
    this.className = this.className + ' sql-editor-container';

    this.viewManager
      .getOrCreateView<LibroOutputArea, IOutputAreaOption>(SqlOutputArea, {
        outputAreaId: this.id,
        cellId: this.id,
        cell: this,
      })
      .then(async (outputArea) => {
        this.outputArea = outputArea;
        const output = this.outputs;
        if (isOutput(output)) {
          await this.outputArea.fromJSON(output);
        }
        this.outputWatch();
        return;
      })
      .catch(() => {
        //
      });
  }

  onViewMount = async () => {
    await this.createEditor();
  };

  override toJSON() {
    const meta = super.toJSON();
    return {
      ...meta,
      execution_count: 1, // make .ipynb file valid
      outputs: this.outputArea?.toJSON() ?? this.outputs,
    };
  }

  createEditor() {
    const option: CodeEditorViewOptions = {
      uuid: this.options.uuid,
      factory: (editorOption) => new SQLEditor(editorOption),
      model: this.cellModel,
      config: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        readOnly: this.parent.model.readOnly,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        editable: !this.parent.model.readOnly,
      },
    };
    return this.viewManager
      .getOrCreateView<CodeEditorView, CodeEditorViewOptions>(CodeEditorView, option)
      .then(async (editorView) => {
        this.editorView = editorView;
        await editorView.editor.editorReady;
        this.handleCommand();
        return;
      })
      .catch(() => {
        //
      });
  }

  handleCommand() {
    const editor = (this.editorView?.editor as SQLEditor)?.monacoEditor;
    if (editor) {
      editor.addCommand(
        9,
        () => {
          this.commandRegistry.executeCommand(NotebookCommands.EnterCommandMode.id);
        },
        '!editorHasSelection && !editorHasSelection && !editorHasMultipleSelections',
      );
      editor.addCommand(
        2048 | 3,
        () => {
          this.commandRegistry.executeCommand(NotebookCommands.RunCell.id);
        },
        '!findWidgetVisible && !referenceSearchVisible',
      );
      editor.addCommand(
        1024 | 3,
        () => {
          this.commandRegistry.executeCommand(NotebookCommands.RunCellAndSelectNext.id);
        },
        '!findInputFocussed',
      );
      editor.addCommand(
        512 | 3,
        () => {
          this.commandRegistry.executeCommand(
            NotebookCommands.RunCellAndInsertBelow.id,
          );
        },
        '!findWidgetVisible',
      );

      editor.addCommand(
        2048 | 1024 | 83,
        () => {
          this.commandRegistry.executeCommand(NotebookCommands.SplitCellAntCursor.id);
        },
        // '!findWidgetVisible',
      );

      editor.addCommand(
        2048 | 36,
        () => {
          this.commandRegistry.executeCommand('libro-search:toggle');
        },
        // '!findWidgetVisible',
      );
    }
  }

  async run() {
    const startTime = new Date().toISOString();

    this.clearExecution();
    this.setExecutionStatus(true, true);
    this.setExecutionTime(startTime, '');
    this.cellModel.executeCount = 1;

    try {
      const data = await this.queryService.doQuery(this.cellModel.value);
      const msg: KernelMessage.IExecuteResultMsg = {
        header: {
          msg_type: 'execute_result',
          date: '',
          msg_id: '',
          session: '',
          username: '',
          version: '',
        },
        metadata: {},
        content: {
          data: {
            'application/vnd.libro.sql+json': data,
          },
          metadata: {},
          execution_count: 1,
        },
        buffers: [],
        channel: 'iopub',
        parent_header: {},
      };
      this.cellModel.msgChangeEmitter.fire(msg);
    } catch (e) {
      if (e instanceof Error) {
        const message = e.message;
        const messageLines = message.split('\n');
        if (messageLines.length > 0) {
          const msg: KernelMessage.IErrorMsg = {
            header: {
              msg_type: 'error',
              date: '',
              msg_id: '',
              session: '',
              username: '',
              version: '',
            },
            metadata: {},
            content: {
              traceback: messageLines.slice(1),
              ename: 'ExecuteQueryException',
              evalue: message,
            },
            buffers: [],
            channel: 'iopub',
            parent_header: {},
          };
          this.cellModel.msgChangeEmitter.fire(msg);
        }
      }
    }

    this.setExecutionStatus(false, false);
    this.setExecutionTime(startTime, new Date().toISOString());

    return true;
  }

  setExecutionStatus(executing: boolean, kernelExecuting: boolean) {
    this.cellModel.executing = executing;
    this.cellModel.kernelExecuting = kernelExecuting;
  }

  setExecutionTime(start: string, end: string) {
    const meta = this.cellModel.metadata.execution as ExecutionMeta;
    if (meta) {
      meta['shell.execute_reply.started'] = start;
      meta.to_execute = start;
      meta['shell.execute_reply.end'] = end;
    }
  }

  // why need this?
  calcEditorAreaHeight() {
    return 0;
  }

  override clearExecution = () => {
    this.cellModel.clearExecution();
    Promise.resolve()
      .then(() => {
        this.outputArea.clear();
        return;
      })
      .catch(console.error);
  };

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
}
