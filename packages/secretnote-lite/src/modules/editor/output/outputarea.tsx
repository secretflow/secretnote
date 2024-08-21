// Outputarea is the area below each cell displaying the output of the cell execution.
// Different from common Jupyter Server, Since SecretNote supports multiple parties executions,
// the output area is customized to display the output of each party properly.

import type {
  ExecutableCellModel,
  IDisplayData,
  IKernelConnection,
  IMimeBundle,
  IOutput,
  IOutputAreaOption,
  KernelMessage,
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
import { l10n } from '@difizen/mana-l10n';

@transient()
@view('libro-output-area')
export class SecretNoteOutputArea extends LibroOutputArea {
  kernelManager: SecretNoteKernelManager;
  kernelOutputs: Record<string, IOutput[]> = {}; // kernel id -> outputs from it

  constructor(
    @inject(ViewOption) option: IOutputAreaOption,
    @inject(SecretNoteKernelManager) kernelManager: SecretNoteKernelManager,
  ) {
    super(option);
    this.kernelManager = kernelManager;
    // manually control the outputs of each kernel and synchronize them with LibroOutputArea.outputs
    this.kernelOutputs = {};
    this.startMsgHandler();
  }

  /**
   * Start handling the message from the kernel connection passed from `cell`.
   * Transform it to proper outputs.
   */
  startMsgHandler() {
    // cell that has output area is always an executable cell instead of a markdown cell, cast it
    const cellModel = this.cell.model as unknown as ExecutableCellModel;

    // this event is fired inside `cell/view.tsx`
    // about messaging, see https://jupyter-client.readthedocs.io/en/latest/messaging.html
    cellModel.msgChangeEmitter.event(
      ({
        kernel,
        msg,
      }: {
        kernel: IKernelConnection;
        msg: KernelMessage.IMessage;
      }) => {
        // ignore heartbeat messages
        if (msg.header.msg_type === 'status') {
          return;
        }
        // TODO ?
        else if (msg.header.msg_type === 'execute_input') {
          cellModel.executeCount = (msg.content as any).execution_count;
        }
        // handle `display_data`, `stream`, `error`, `execute_result` messages
        // these are most common output types
        else if (
          isDisplayDataMsg(msg) ||
          isStreamMsg(msg) ||
          isErrorMsg(msg) ||
          isExecuteResultMsg(msg)
        ) {
          const output: IOutput = {
            ...msg.content,
            output_type: msg.header.msg_type,
          };
          this.addOutput(kernel, output);
        }
        // handle `execute_reply` message
        else if (isExecuteReplyMsg(msg)) {
          // TODO ?
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
          };
          this.addOutput(kernel, output);
        }
      },
    );
  }

  /**
   * Append a kernel's output to the output area.
   */
  addOutput(kernel: IKernelConnection, output: IOutput) {
    const outputs = this.kernelOutputs[kernel.id] || [];
    // add the leading output if the outputs are empty
    if (outputs.length === 0) {
      outputs.push(this.makeLeadingOutput(kernel));
    }

    const lastIndex = outputs.length - 1;
    const preOutput = outputs[lastIndex];
    if (
      isStream(output) &&
      isStream(preOutput) &&
      output.name === preOutput.name
    ) {
      // merge two continuous stream outputs
      // hanlde backspace and carriage-return, concat the text
      output.text = removeOverwrittenChars(
        preOutput.text + normalize(output.text),
      );
      // just replace the previous output, don't push new
      outputs[lastIndex] = output;
      this.flushOutputs();
      return;
    } else if (isStream(output)) {
      // handle first stream output
      output.text = removeOverwrittenChars(normalize(output.text));
    }
    // no extra logics for other types of outputs

    // update the outputs of the kernel and flush it
    outputs.push(output);
    this.kernelOutputs[kernel.id] = outputs;
    this.flushOutputs();
  }

  /**
   * Flush all kernel outputs to the output area.
   */
  async flushOutputs() {
    const kernelCount = Object.keys(this.kernelOutputs).length;
    let outputs = Object.values(this.kernelOutputs).flat();
    if (kernelCount < 2) {
      // remove the leading output title if there is only one kernel
      outputs = outputs.filter((output) => !output.isLeading);
    }
    // dispose all previous outputs
    this.outputs.forEach((output) => output.dispose());
    // create new outputs
    this.outputs = await Promise.all(
      outputs.map((output) => this.doCreateOutput(output)),
    );
  }

  /**
   * Construct a special `leading output` (as display_data) displayed as title on
   * the very first line of each kernel's output to indicate the output source.
   */
  makeLeadingOutput(kernel: IKernelConnection) {
    const server = this.kernelManager.getServerByKernelConnection(kernel);
    const name = server?.name || kernel.clientId;
    const output: IDisplayData = {
      output_type: 'display_data',
      data: {
        'text/html': `<h4>${name} ${l10n.t('的输出')}</h4>`,
      },
      metadata: {},
      isLeading: true, // a flag to indicate the leading output
    };

    return output;
  }

  /**
   * Clear the all kernel outputs of current cell.
   * @override LibroOutputArea.clear
   */
  clear() {
    super.clear.call(this, false);
    this.kernelOutputs = {};
    this.flushOutputs();
  }
}
