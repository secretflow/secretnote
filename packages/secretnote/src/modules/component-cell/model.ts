/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ExecutedWithKernelCellModel,
  ExecutionCount,
  ICellMetadata,
  IOutput,
} from '@difizen/libro-jupyter';
import {
  CellOptions,
  LibroCellModel,
  concatMultilineString,
} from '@difizen/libro-jupyter';
import { Emitter, prop } from '@difizen/mana-app';
import { inject, transient } from '@difizen/mana-app';
import type { Event } from '@difizen/mana-common';

export interface ComponentMetadata {
  component: {
    id: string[];
    params: Record<string, any>;
  };
}

@transient()
export class ComponentCellModel
  extends LibroCellModel
  implements ExecutedWithKernelCellModel
{
  mimeType = 'application/vnd.libro.component+json';
  hasOutputHidden = false;
  hasOutputsScrolled = false;

  @prop()
  isEdit = false;

  @prop()
  executing: boolean;

  @prop()
  kernelExecuting: boolean;

  @prop()
  executeCount: ExecutionCount = null;

  msgChangeEmitter: Emitter<any>;

  get msgChange(): Event<any> {
    return this.msgChangeEmitter.event;
  }

  @prop()
  metadata: Partial<ComponentMetadata | ICellMetadata>;

  @prop()
  outputs: IOutput[] = [];

  constructor(@inject(CellOptions) options: CellOptions) {
    super(options);
    this.executing = false;
    this.kernelExecuting = false;
    this.msgChangeEmitter = new Emitter<any>();
    this.metadata = options.cell.metadata || {};
    this.outputs = (options.cell.outputs as IOutput[]) || [];
    this.value = concatMultilineString(options.cell.source);
  }

  clearExecution(): void {
    this.metadata = {};
    this.outputs = [];
    this.executing = false;
    this.kernelExecuting = false;
    this.executeCount = null;
  }
}
