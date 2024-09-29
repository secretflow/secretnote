import type {
  ExecutionMeta,
  CodeCellMetadata,
  ExecutedWithKernelCellModel,
  ExecutionCount,
  KernelMessage,
} from '@difizen/libro-jupyter';
import { CellOptions, LibroCellModel } from '@difizen/libro-jupyter';
import { inject, prop, transient, Emitter } from '@difizen/mana-app';

export interface SqlCellMetadata extends CodeCellMetadata {
  execution: ExecutionMeta;
}

@transient()
export class SQLCellModel
  extends LibroCellModel
  implements ExecutedWithKernelCellModel
{
  mimeType = 'application/vnd.libro.sql+json';
  hasOutputHidden = false;
  hasOutputsScrolled = false;

  @prop() metadata: Partial<SqlCellMetadata>;
  @prop() executing = false;
  @prop() kernelExecuting = false;
  @prop() executeCount: ExecutionCount = null;
  @prop() isEdit = false;

  msgChangeEmitter = new Emitter<KernelMessage.IIOPubMessage>();

  msgChange = this.msgChangeEmitter.event;

  constructor(@inject(CellOptions) options: CellOptions) {
    super(options);
    this.metadata = options.cell.metadata || {};
  }

  clearExecution = () => {
    this.executeCount = null;
    this.executing = false;
    this.kernelExecuting = false;
    this.clearExecutionMetadata();
  };

  clearExecutionMetadata = () => {
    this.metadata.execution = {
      'shell.execute_reply.started': '',
      'shell.execute_reply.end': '',
      to_execute: '',
    };
  };

  dispose() {
    super.dispose();
    this.msgChangeEmitter.dispose();
  }
}
