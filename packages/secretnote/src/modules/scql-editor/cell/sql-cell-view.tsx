import type {
  LibroOutputArea,
  CellViewOptions,
  IOutputAreaOption,
  IOutput,
  ExecutionMeta,
  CodeEditorViewOptions,
} from '@difizen/libro-jupyter';
import {
  CellService,
  CellEditorMemo,
  isOutput,
  CodeEditorView,
  JupyterCodeCellView,
  NotebookCommands,
} from '@difizen/libro-jupyter';
import {
  inject,
  transient,
  useInject,
  view,
  ViewInstance,
  ViewManager,
  ViewOption,
  CommandRegistry,
} from '@difizen/mana-app';
import { forwardRef } from 'react';

import { SQLEditor } from '../editor';
import { SqlOutputArea } from '../output';
import { SCQLQueryService } from '../service';

export const SqlCellComponent = forwardRef<HTMLDivElement>((props, ref) => {
  const instance = useInject<SqlCellView>(ViewInstance);

  return (
    <div tabIndex={10} ref={ref} className={instance.className} onBlur={instance.blur}>
      <CellEditorMemo />
    </div>
  );
});
SqlCellComponent.displayName = 'SqlCellComponent';

@transient()
@view('sql-cell-view')
export class SqlCellView extends JupyterCodeCellView {
  override view = SqlCellComponent;
  readonly queryService: SCQLQueryService;
  readonly viewManager: ViewManager;
  readonly commandRegistry: CommandRegistry;

  constructor(
    @inject(ViewOption) options: CellViewOptions,
    @inject(CellService) cellService: CellService,
    @inject(ViewManager) viewManager: ViewManager,
    @inject(SCQLQueryService) queryService: SCQLQueryService,
    @inject(CommandRegistry) commandRegistry: CommandRegistry,
  ) {
    super(options, cellService, viewManager);
    this.options = options;
    this.queryService = queryService;
    this.viewManager = viewManager;
    this.commandRegistry = commandRegistry;

    this.outputs = options.cell?.outputs as IOutput[];
    this.className = this.className + ' sql';

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

  createEditor() {
    const option: CodeEditorViewOptions = {
      factory: (editorOption) => new SQLEditor(editorOption),
      model: this.model,
      config: {
        readOnly: this.parent.model.readOnly,
        editable: !this.parent.model.readOnly,
      },
    };
    this.viewManager
      .getOrCreateView<CodeEditorView, CodeEditorViewOptions>(CodeEditorView, option)
      .then(async (editorView) => {
        this.editorView = editorView;

        await this.editorView.editorReady;
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
    this.clearExecution();
    this.model.executing = true;
    this.model.kernelExecuting = true;
    this.model.executeCount = 1;

    const startTime = new Date().toISOString();
    this.setExecutionTime({
      start: startTime,
      toExecute: startTime,
      end: '',
    });

    try {
      const data = await this.queryService.query(this.model.value);
      const msg = {
        header: {
          msg_type: 'execute_result',
        },
        msg_type: 'execute_result',
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
      };
      this.model.msgChangeEmitter.fire(msg);
    } catch (e) {
      if (e instanceof Error) {
        const message = e.message;
        const messageLines = message.split('\n');
        if (messageLines.length > 0) {
          const msg = {
            header: {
              msg_type: 'error',
            },
            msg_type: 'error',
            metadata: {},
            content: {
              traceback: messageLines.slice(1),
              ename: 'ExecuteQueryException',
              evalue: messageLines[0],
            },
            buffers: [],
            channel: 'iopub',
          };
          this.model.msgChangeEmitter.fire(msg);
        }
      }
    }
    this.model.executing = false;
    this.model.kernelExecuting = false;

    this.setExecutionTime({
      start: startTime,
      toExecute: startTime,
      end: new Date().toISOString(),
    });

    return true;
  }

  setExecutionTime(times: { start?: string; end?: string; toExecute?: string }) {
    const meta = this.model.metadata.execution as ExecutionMeta;
    if (meta) {
      const { start, end, toExecute } = times;
      if (start !== undefined) {
        meta['shell.execute_reply.started'] = start;
      }
      if (end !== undefined) {
        meta['shell.execute_reply.end'] = end;
      }
      if (toExecute !== undefined) {
        meta.to_execute = toExecute;
      }
    }
  }
}
