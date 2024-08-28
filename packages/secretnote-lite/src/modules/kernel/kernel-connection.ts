// In SecretFlow, many APIs spawn new processes or new threads, which means some subsequent
// cell's outputs might internally belongs to previous cells even if previous cells are settled
// already after `execute_reply` message and `idle` status. (To reproduce, catch some WebSocket
// messages when a cell makes SecretFlow error, observe their `parent_header`'s `msg_id`
// and you'll know the issue.) This leads to some unwanted behaviors.
// 1. By default, the `future` of previous cells are disposed on done
//   (see `kernel.requestExecute` in `SecretNoteCodeCellView`'s `run`),
//   making subsequent cells orphaned (whose `parent_header` includes a disposed `msg_id`).
//   These messages will be then discarded by Libro (see `_handleMessage` in `libro-kernel`'s
//   `KernelConnection`) and never be displayed in the output area, confusing users.
// 2. If we set `disposeOnDone` to `false`, some subsequent outputs that are born when the
//    current cell is executed will still be displayed in the previous wrong cell (usually
//    the one that SecretFlow is initialized in) instead of current one. Also, we need to
//    manually dispose those `future`s to avoid memory leaks which is bothersome.
// Worth readings:
//    jupyter/jupyter_client/issues/297; jupyter/notebook/issues/518; jupyterlab/jupyterlab/issues/629;
//    ipykernel/iostream.py/OutStream/parent_header
// To solve this, we need to customize the `KernelConnection`.

import {
  isErrorMsg,
  isExecuteInputMsg,
  isStreamMsg,
  KernelConnection,
  type KernelMessage,
} from '@difizen/libro-jupyter';
import { transient } from '@difizen/mana-app';

@transient()
export class SecretNoteKernelConnection extends KernelConnection {
  // keep recording the last execute_request message sent from the frontend
  // so that the orphaned messages can be linked to this corresponding cell
  protected _lastExecuteRequestHeader: KernelMessage.IHeader | null = null;

  override _handleMessage(msg: KernelMessage.IMessage): Promise<void> {
    if (
      msg.channel === 'iopub' && // on iopub channel
      (isStreamMsg(msg) || isErrorMsg(msg)) && // is stream or error message
      msg.parent_header && // has parent header
      !this._futures?.get(msg.parent_header.msg_id) // but orphaned now
    ) {
      // assign its parent to be the latest execution's message
      this._lastExecuteRequestHeader &&
        (msg.parent_header = this._lastExecuteRequestHeader);
    }

    // call the parent method as usual
    const res = super._handleMessage(msg);

    // update the last execute request header
    if (msg.channel === 'iopub' && isExecuteInputMsg(msg)) {
      // the latest execute_input's parent is the latest execute_request
      this._lastExecuteRequestHeader = msg.parent_header as KernelMessage.IHeader;
    }

    return res;
  }
}
