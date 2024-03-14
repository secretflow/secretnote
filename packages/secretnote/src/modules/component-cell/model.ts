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
import type { Value } from '@/components/component-form';

// type of sf.report from secretflow component
export type SFReport = {
  name: string;
  type: 'sf.report';
  systemInfo: Value;
  meta: {
    '@type': 'type.googleapis.com/secretflow.spec.v1.Report';
    name: string;
    desc: string;
    // @see https://github.com/secretflow/spec/blob/main/secretflow/spec/v1/report.proto
    tabs: {
      divs: {
        children: {
          type: 'table';
          table: {
            headers: {
              name: string;
              type: string;
            }[];
            rows: {
              name: string;
              items: Value[]; // value of this row, {protobuf type -> value}[]
            }[];
          };
        }[];
      }[];
    }[];
  };
};

// type of necessary data for the Report tab
export type ComponentReport = {
  name: string; // name
  metaName: string; // .meta.name
  metaDesc: string; // .meta.desc
  metaColumnNames: string[]; // column names of the table
  metaRowNames: string[]; // row names of the table
  metaRowItems: Value[]; // table cells
};

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

  @prop()
  report: ComponentReport | null;

  constructor(@inject(CellOptions) options: CellOptions) {
    super(options);
    this.executing = false;
    this.kernelExecuting = false;
    this.msgChangeEmitter = new Emitter<any>();
    this.metadata = options.cell.metadata || {};
    this.outputs = (options.cell.outputs as IOutput[]) || [];
    this.report = (options.cell.report as ComponentReport) || null;
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
