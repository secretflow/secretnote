import type { ExecutionMeta, CodeCellMetadata } from '@difizen/libro-jupyter';
import { CellOptions, JupyterCodeCellModel } from '@difizen/libro-jupyter';
import { inject, prop, transient, ViewManager } from '@difizen/mana-app';

export interface SqlCellMetadata extends CodeCellMetadata {
  execution: ExecutionMeta;
}

@transient()
export class SqlCellModel extends JupyterCodeCellModel {
  @prop()
  metadata: Partial<SqlCellMetadata>;

  constructor(
    @inject(CellOptions) options: CellOptions,
    @inject(ViewManager) viewManager: ViewManager,
  ) {
    super(options, viewManager);
    this.mimeType = 'application/vnd.libro.sql+json';
    this.metadata = options.cell.metadata || {};
  }

  clearExecution = () => {
    this.executeCount = null;
    this.executing = false;
    this.kernelExecuting = false;
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

  getSource() {
    return this.value;
  }
}
