import type {
  LibroOutputArea,
  CellViewOptions,
  IOutputAreaOption,
  IOutput,
} from '@difizen/libro-jupyter';
import {
  CellService,
  CellEditorMemo,
  JupyterCodeCellView,
  isOutput,
} from '@difizen/libro-jupyter';
import {
  inject,
  transient,
  useInject,
  view,
  ViewInstance,
  ViewManager,
  ViewOption,
  watch,
} from '@difizen/mana-app';
import { forwardRef } from 'react';

import { SqlOutputArea } from '../output';
import { SCQLQueryService } from '../service';

import '../index.less';

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

  constructor(
    @inject(ViewOption) options: CellViewOptions,
    @inject(CellService) cellService: CellService,
    @inject(ViewManager) viewManager: ViewManager,
    @inject(SCQLQueryService) queryService: SCQLQueryService,
  ) {
    super(options, cellService, viewManager);
    this.options = options;
    this.viewManager = viewManager;
    this.queryService = queryService;

    this.outputs = options.cell?.outputs as IOutput[];
    this.className = this.className + ' sql';

    // 创建outputArea
    this.viewManager
      .getOrCreateView<LibroOutputArea, IOutputAreaOption>(SqlOutputArea, {
        cellId: this.id,
        cell: this,
      })
      .then(async (outputArea) => {
        this.outputArea = outputArea;
        const output = this.outputs;
        if (isOutput(output)) {
          await this.outputArea.fromJSON(output);
        }
        this.outputAreaDeferred.resolve(outputArea);
        this.outputWatch();
        return;
      })
      .catch(() => {
        //
      });
  }

  override outputWatch() {
    this.toDispose.push(
      watch(this.outputArea, 'outputs', () => {
        this.parent.model.onChange?.();
      }),
    );
  }

  async run() {
    this.clearExecution();
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
            'text/html': this.queryService.queryResult2Html(data),
          },
          metadata: {},
          execution_count: 2,
        },
        buffers: [],
        channel: 'iopub',
      };
      this.model.msgChangeEmitter.fire(msg);
    } catch (e) {
      if (e instanceof Error) {
        const msg = {
          header: {
            msg_type: 'error',
          },
          msg_type: 'error',
          metadata: {},
          content: {
            traceback: [],
            ename: 'ExecuteQueryException',
            evalue: e.message,
          },
          buffers: [],
          channel: 'iopub',
        };
        this.model.msgChangeEmitter.fire(msg);
      }
    }

    return true;
  }
}
