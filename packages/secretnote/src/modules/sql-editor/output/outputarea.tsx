import type { IMimeBundle, IOutput, IOutputAreaOption } from '@difizen/libro-jupyter';
import {
  isDisplayDataMsg,
  isErrorMsg,
  isExecuteReplyMsg,
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
        if (msg.header.msg_type === 'execute_input') {
          cellModel.executeCount = msg.content.execution_count;
        }
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
        //Handle an execute reply message.
        if (isExecuteReplyMsg(msg)) {
          const content = msg.content;
          if (content.status !== 'ok') {
            return;
          }
          const payload = content && content.payload;
          if (!payload || !payload.length) {
            return;
          }
          const pages = payload.filter((i: any) => i.source === 'page');
          if (!pages.length) {
            return;
          }
          const page = JSON.parse(JSON.stringify(pages[0]));
          const output: IOutput = {
            output_type: 'display_data',
            data: page.data as IMimeBundle,
            metadata: {},
          };
          this.add(output);
        }
      }
    });
  }
}
