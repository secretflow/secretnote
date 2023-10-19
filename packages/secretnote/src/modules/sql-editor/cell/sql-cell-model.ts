import type { ExecutionMeta, ICodeCellMetadata } from '@difizen/libro-jupyter';
import { CellOptions, JupyterCodeCellModel } from '@difizen/libro-jupyter';
import { inject, prop, transient, ViewManager } from '@difizen/mana-app';

import { IntegrationService } from '@/modules/integration';

export interface SqlCellMetadata extends ICodeCellMetadata {
  execution: ExecutionMeta;
  variableName: string;
  sourceName: string;
}
@transient()
export class SqlCellModel extends JupyterCodeCellModel {
  readonly integrationService: IntegrationService;

  @prop()
  variableName: string | undefined;

  @prop()
  sourceName: string | undefined;

  @prop()
  metadata: Partial<SqlCellMetadata>;

  constructor(
    @inject(CellOptions) options: CellOptions,
    @inject(ViewManager) viewManager: ViewManager,
    @inject(IntegrationService) integrationService: IntegrationService,
  ) {
    super(options, viewManager);
    this.integrationService = integrationService;
    this.mimeType = 'application/vnd.libro.sql+json';
    this.metadata = options.cell.metadata || {};
    this.variableName = this.metadata.variableName;
    this.sourceName = this.metadata.sourceName;
  }

  generateExecutableCode = () => {
    if (!(this.sourceName && this.variableName)) {
      return this.value;
    }
    const code = this.integrationService.generateExecutableCode(
      this.sourceName,
      this.variableName,
      this.value,
    );
    return code;
  };

  clearExecution = () => {
    this.executeCount = null;
    this.executing = false;
  };

  dispose() {
    super.dispose();
    this.msgChangeEmitter.dispose();
  }

  getSource() {
    return this.value;
  }
}
