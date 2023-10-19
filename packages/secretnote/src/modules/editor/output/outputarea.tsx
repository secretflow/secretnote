import type {
  ExecutableCellModel,
  IKernelConnection,
  IMimeBundle,
  IOutput,
  KernelMessage,
  IOutputAreaOption,
} from '@difizen/libro-jupyter';
import {
  isDisplayDataMsg,
  isErrorMsg,
  isExecuteReplyMsg,
  isExecuteResultMsg,
  isStream,
  isStreamMsg,
  LibroOutputArea,
  normalize,
  removeOverwrittenChars,
} from '@difizen/libro-jupyter';
import { inject, transient, view, ViewOption } from '@difizen/mana-app';

import { SecretNoteKernelManager } from '@/modules/kernel';
import { uuid } from '@/utils';

@transient()
@view('libro-output-area')
export class SecretNoteOutputArea extends LibroOutputArea {
  kernelManager: SecretNoteKernelManager;
  connectionId2Message: Record<string, IOutput[]> = {};

  constructor(
    @inject(ViewOption) option: IOutputAreaOption,
    @inject(SecretNoteKernelManager) kernelManager: SecretNoteKernelManager,
  ) {
    super(option);
    this.kernelManager = kernelManager;
    this.connectionId2Message = {};
    this.handleMsg();
  }

  handleMsg() {
    const cellModel = this.cell.model as unknown as ExecutableCellModel;
    cellModel.msgChangeEmitter.event(
      ({
        connection,
        msg,
      }: {
        connection: IKernelConnection;
        msg: KernelMessage.IMessage;
      }) => {
        if (msg.header.msg_type === 'status') {
          return;
        }
        if (msg.header.msg_type === 'execute_input') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          cellModel.executeCount = (msg.content as any).execution_count;
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
            _outputId: uuid(),
          };
          this.addOutput(connection, output);
        }

        if (isExecuteReplyMsg(msg)) {
          const content = msg.content;
          if (content.status !== 'ok') {
            return;
          }
          const payload = content && content.payload;
          if (!payload || !payload.length) {
            return;
          }
          const pages = payload.filter((i) => i.source === 'page');
          if (!pages.length) {
            return;
          }

          const page = JSON.parse(JSON.stringify(pages[0]));
          const output: IOutput = {
            output_type: 'display_data',
            data: page.data as IMimeBundle,
            metadata: {},
            _outputId: uuid(),
          };
          this.addOutput(connection, output);
        }
      },
    );
  }

  addOutput(connection: IKernelConnection, output: IOutput) {
    const outputs = this.connectionId2Message[connection.id] || [];
    if (outputs.length === 0) {
      outputs.push(this.getBreakOutput(connection));
    }
    const lastIndex = outputs.length - 1;
    const preOutput = outputs[lastIndex];

    if (isStream(output) && isStream(preOutput) && output.name === preOutput.name) {
      output.text = removeOverwrittenChars(preOutput.text + normalize(output.text));
      outputs[lastIndex] = output;
      this.flushOutputs();
      return;
    }

    if (isStream(output)) {
      output.text = removeOverwrittenChars(normalize(output.text));
    }

    outputs.push(output);
    this.connectionId2Message[connection.id] = outputs;

    this.flushOutputs();
  }

  async flushOutputs() {
    const outputs = Object.values(this.connectionId2Message).flat();
    this.outputs.forEach((output) => {
      output.dispose();
    });
    this.outputs = await Promise.all(
      outputs.map((output) => this.doCreateOutput(output)),
    );
  }

  getBreakOutput(connection: IKernelConnection) {
    const server = this.kernelManager.getServerByKernelConnection(connection);
    const name = server?.name || connection.clientId;
    const output: IOutput = {
      output_type: 'display_data',
      data: {
        'text/html': `<h4>${name}'s Output:</h4>`,
      },
      metadata: {},
      _outputId: uuid(),
    };
    return output;
  }

  clear() {
    super.clear();
    this.connectionId2Message = {};
  }
}
