import type { IOutputAreaOption, IOutput } from '@difizen/libro-jupyter';
import {
  isDisplayDataMsg,
  isErrorMsg,
  isExecuteResultMsg,
  isStreamMsg,
  LibroOutputArea,
} from '@difizen/libro-jupyter';
import { inject, transient, view, ViewOption } from '@difizen/mana-app';

import type { SqlCellModel } from '../cell';

@transient()
@view('libro-sql-output-area')
export class SqlOutputArea extends LibroOutputArea {
  constructor(@inject(ViewOption) option: IOutputAreaOption) {
    super(option);
    this.handleMsg();
  }

  handleMsg() {
    const cellModel = this.cell.model as SqlCellModel;
    cellModel.msgChange((msg) => {
      if (msg.header.msg_type !== 'status') {
        if (
          isDisplayDataMsg(msg) ||
          isStreamMsg(msg) ||
          isErrorMsg(msg) ||
          isExecuteResultMsg(msg)
        ) {
          const output: IOutput = {
            ...msg.content,
            output_type: msg.header.msg_type,
          };
          this.add(output);
        }
      }
    });
  }
}
