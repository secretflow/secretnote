import { E2SqlEdit, LibroSqlEditor } from '@difizen/libro-e2-sql-cell';
import type {
  ExecutionMeta,
  ICodeCell,
  IOutput,
  IOutputAreaOption,
  KernelMessage,
  LibroCell,
  LibroOutputArea,
  CellViewOptions,
} from '@difizen/libro-jupyter';
import {
  CellService,
  isOutput,
  KernelError,
  LibroExecutableCellView,
  LibroService,
  LibroViewTracker,
  LirboContextKey,
} from '@difizen/libro-jupyter';
import {
  Deferred,
  getOrigin,
  inject,
  transient,
  useInject,
  view,
  ViewInstance,
  ViewManager,
  ViewOption,
  watch,
} from '@difizen/mana-app';
import type monaco from '@difizen/monaco-editor-core';
import { Input, message, Popover } from 'antd';
import { ChevronDown, Pencil } from 'lucide-react';
import { forwardRef, useCallback, useRef, useState } from 'react';

import { DropdownMenu } from '@/components/dropdown-menu';
import type { SecretNoteModel } from '@/modules/editor';
import { IntegrationService } from '@/modules/integration';

import '../index.less';
import { SqlOutputArea } from '../output';

import { SqlCellModel } from './sql-cell-model';

export const getDfVariableName = (cells: SqlCellView[]) => {
  let id = 1;

  while (true) {
    let idExisted = false;
    for (const cell of cells) {
      if (cell.model.variableName === `df_${id}`) {
        idExisted = true;
        break;
      }
    }
    if (idExisted) {
      id++;
    } else {
      break;
    }
  }

  return `df_${id}`;
};

const SqlVariableNameInput = ({ handCancel }: { handCancel: () => void }) => {
  const cellView = useInject<SqlCellView>(ViewInstance);
  const [variableNameAvailable, setVariableNameAvailable] = useState(true);
  const [variableName, setVariableName] = useState(cellView.model.variableName);
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (
        cellView.parent.model.cells.findIndex(
          (cell) =>
            cell.model instanceof SqlCellModel &&
            cell.model.variableName === e.target.value,
        ) > -1
      ) {
        setVariableNameAvailable(false);
      } else {
        setVariableNameAvailable(true);
      }
      setVariableName(e.target.value);
    },
    [cellView.parent.model.cells],
  );

  const onSave = useCallback(() => {
    cellView.model.variableName = getDfVariableName(
      cellView.parent.model.cells.filter(
        (cell) => cell.model.type === 'sql',
      ) as SqlCellView[],
    );
    cellView.model.metadata.variableName = variableName;
    cellView.model.variableName = variableName;
    if (cellView.parent.model.onChange) {
      cellView.parent.model.onChange();
    }
    handCancel();
  }, [cellView.model, cellView.parent.model, handCancel, variableName]);

  return (
    <>
      <Input
        status={`${variableNameAvailable ? '' : 'warning'}`}
        className="sql-variable-name-input"
        onChange={onChange}
        defaultValue={cellView.model.variableName}
      />

      {!variableNameAvailable && (
        <span className="sql-input-warning-text">当前变量名已存在</span>
      )}

      <div className="sql-input-button">
        <span onClick={handCancel} className="sql-input-cancel">
          取消
        </span>
        <span onClick={onSave} className="sql-input-save">
          保存
        </span>
      </div>
    </>
  );
};

export const SqlCellComponent = forwardRef<HTMLDivElement>((props, ref) => {
  const [isVariableNameEdit, setIsVariableNameEdit] = useState(false);
  const instance = useInject<SqlCellView>(ViewInstance);
  const contextKey = useInject(LirboContextKey);
  const libroService = useInject(LibroService);
  const integrations = instance.integrationService.integrations.map((i) => ({
    key: i.name,
    label: i.name,
    icon: instance.integrationService.getIntegrationMeta(i.type)?.icon,
  }));

  const editorInstance = useRef<monaco.editor.IStandaloneCodeEditor>();
  if (editorInstance.current) {
    instance.editor = new LibroSqlEditor(editorInstance.current);
  }

  const handCancelEdit = () => {
    contextKey.enableCommandMode();
    setIsVariableNameEdit(false);
  };

  return (
    <div tabIndex={10} ref={ref} className={instance.className}>
      <div className="sql-cell-header">
        <div className="sql-source">
          <span className="sql-source-title">Source: </span>
          <span className="sql-source-content">
            <DropdownMenu
              items={integrations}
              icon={
                <span className="sql-source-dropdown">
                  <span className="source-name">
                    {instance.model.sourceName || 'None'}
                  </span>
                  <ChevronDown size={12} />
                </span>
              }
              onClick={(key) => {
                instance.model.sourceName = key;
                instance.model.metadata.sourceName = key;
              }}
            />
          </span>
        </div>
        <div className="sql-save-selector">
          <span className="sql-save-title">Save as: </span>
          <div className="sql-save-dropdown">DataFrame</div>
        </div>
        <div className="sql-variable-name">
          <span className="sql-variable-name-title">Name: </span>
          <span className="sql-variable-content">{instance.model.variableName}</span>
          <div className="sql-variable-name-popover">
            <Popover
              content={<SqlVariableNameInput handCancel={handCancelEdit} />}
              placement="bottomLeft"
              open={instance.parent.model.readOnly ? false : isVariableNameEdit}
              onOpenChange={(visible) => {
                if (visible) {
                  contextKey.disableCommandMode();
                } else {
                  contextKey.enableCommandMode();
                }
                setIsVariableNameEdit(visible);
              }}
              getPopupContainer={() => {
                return instance.container?.current?.getElementsByClassName(
                  'sql-variable-name',
                )[0] as HTMLElement;
              }}
              trigger="click"
              overlayClassName="sql-popover-container"
            >
              <Pencil size={12} className="sql-edit-icon" />
            </Popover>
          </div>
        </div>
      </div>
      <E2SqlEdit
        fontSize={instance.parent.model.fontSize}
        theme={libroService.themeMode === 'dark' ? 'darkTheme' : 'ligthWhiteTheme'}
        editor={editorInstance}
        ref={ref}
      />
    </div>
  );
});

@transient()
@view('sql-cell-view')
export class SqlCellView extends LibroExecutableCellView {
  view = SqlCellComponent;
  libroViewTracker: LibroViewTracker;
  outputs: IOutput[];
  editorReadyDeferred: Deferred<void> = new Deferred<void>();
  outputAreaDeferred = new Deferred<LibroOutputArea>();
  readonly integrationService: IntegrationService;
  declare model: SqlCellModel;

  get outputAreaReady() {
    return this.outputAreaDeferred.promise;
  }

  get editorReady() {
    return this.editorReadyDeferred.promise;
  }

  constructor(
    @inject(ViewOption) options: CellViewOptions,
    @inject(CellService) cellService: CellService,
    @inject(ViewManager) viewManager: ViewManager,
    @inject(LibroViewTracker) libroViewTracker: LibroViewTracker,
    @inject(IntegrationService) integrationService: IntegrationService,
  ) {
    super(options, cellService);

    this.outputs = options.cell?.outputs as IOutput[];
    this.className = this.className + ' sql';
    this.integrationService = integrationService;

    viewManager
      .getOrCreateView<SqlOutputArea, IOutputAreaOption>(SqlOutputArea, {
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
        this.outputAreaDeferred.resolve(outputArea);
        this.outputWatch();
      });
    this.libroViewTracker = libroViewTracker;
    if (!this.model.variableName) {
      const dfName = getDfVariableName(
        this.libroViewTracker.viewCache
          .get(options.parentId)
          ?.model.cells.filter((cell) => cell.model.type === 'sql') as SqlCellView[],
      );
      this.model.variableName = dfName;
      this.model.metadata.variableName = dfName;
    }
  }

  outputWatch() {
    this.toDispose.push(
      watch(this.outputArea, 'outputs', () => {
        this.parent.model.onChange?.();
      }),
    );
  }

  onViewMount = (): void => {
    if (this.editor instanceof LibroSqlEditor) {
      this.editor?.monacoEditor?.layout();
    }
  };

  onViewResize = (): void => {
    if (this.editor instanceof LibroSqlEditor) {
      this.editor?.monacoEditor?.layout();
    }
  };

  toJSON(): LibroCell {
    const meta = super.toJSON();
    return {
      ...meta,
      source: meta.source ?? this.options.cell.source,
      outputs: this.outputArea?.toJSON() ?? this.outputs,
    } as ICodeCell;
  }

  focus = (toEdit: boolean) => {
    if (toEdit) {
      if (this.parent.model.readOnly === true) {
        return;
      }
      if (!this.editor) {
        this.editorReady.then(() => {
          if (this.editor?.hasFocus()) {
            return;
          }
          if (this.editor instanceof LibroSqlEditor) {
            this.editor?.monacoEditor?.layout();
          }
          this.editor?.focus();
        });
      } else {
        if (this.editor?.hasFocus()) {
          return;
        }
        if (this.editor instanceof LibroSqlEditor) {
          this.editor?.monacoEditor?.layout();
        }
        this.editor?.focus();
      }
    } else {
      if (this.container?.current?.parentElement?.contains(document.activeElement)) {
        return;
      }
      this.container?.current?.parentElement?.focus();
    }
  };

  blur() {}

  redo(): void {}

  undo(): void {}

  clearExecution = () => {
    this.model.clearExecution();
    this.outputArea.clear();
  };

  async run() {
    const model = this.parent.model as SecretNoteModel;

    if (!model) {
      return false;
    }

    if (!this.model.sourceName) {
      message.info('Please select a source first.');
      return false;
    }

    if (!this.model.variableName) {
      message.info('Please input a variable name first.');
      return false;
    }

    const kernelConnection = getOrigin(model.kernelConnection);

    if (!kernelConnection) {
      message.info('No available kernel connection.');
      return false;
    }

    try {
      this.clearExecution();
      const future = kernelConnection.requestExecute({
        code: this.model.generateExecutableCode(),
      });

      let startTimeStr = null;
      this.model.executing = true;

      this.model.metadata.execution = {
        'shell.execute_reply.started': '',
        'shell.execute_reply.end': '',
        to_execute: new Date().toISOString(),
      } as ExecutionMeta;

      future.onIOPub = (
        msg: KernelMessage.IIOPubMessage<KernelMessage.IOPubMessageType>,
      ) => {
        this.model.msgChangeEmitter.fire(msg);
        if (msg.header.msg_type === 'execute_input') {
          this.model.kernelExecuting = true;
          startTimeStr = msg.header.date;
          const meta = this.model.metadata.execution as ExecutionMeta;
          if (meta) {
            meta['shell.execute_reply.started'] = startTimeStr;
          }
        }
      };

      const msgPromise = await future.done;
      this.model.executing = false;
      this.model.kernelExecuting = false;

      startTimeStr = msgPromise.metadata.started as string;
      const endTimeStr = msgPromise.header.date;

      this.model.metadata.execution['shell.execute_reply.started'] = startTimeStr;
      this.model.metadata.execution['shell.execute_reply.end'] = endTimeStr;

      if (!msgPromise) {
        return true;
      }
      if (msgPromise.content.status === 'ok') {
        return true;
      } else {
        throw new KernelError(msgPromise.content);
      }
    } catch (reason: any) {
      if (reason.message.startsWith('Canceled')) {
        return false;
      }
      throw reason;
    }
  }

  getSelections = () => {
    return this.editor?.getSelections() as [];
  };

  shouldEnterEditorMode(e: React.FocusEvent<HTMLElement>) {
    return getOrigin(this.editor!.host).contains(e.target as HTMLElement)
      ? true
      : false;
  }

  getSelectionsOffsetAt = (selection: any) => {
    const isSelect = selection;
    if (!(this.editor instanceof LibroSqlEditor)) {
      return { start: 0, end: 0 };
    }

    if (!isSelect?.isEmpty()) {
      const firstOffset =
        this.editor?.monacoEditor.getModel()?.getOffsetAt({
          lineNumber: isSelect?.startLineNumber as number,
          column: isSelect?.startColumn as number,
        }) || 0;

      const endOffset =
        this.editor?.monacoEditor.getModel()?.getOffsetAt({
          lineNumber: isSelect?.endLineNumber as number,
          column: isSelect?.endColumn as number,
        }) || 0;

      return { start: firstOffset, end: endOffset };
    } else {
      const position = this.editor?.monacoEditor.getPosition();
      if (position) {
        const positionIndex =
          this.editor?.monacoEditor.getModel()?.getOffsetAt(position) || 0;
        return { start: positionIndex, end: positionIndex };
      }
    }
    return { start: 0, end: 0 };
  };
}
