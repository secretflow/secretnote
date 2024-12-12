// This is the customized view for a single cell (editable area).

import type {
  CellViewOptions,
  ExecutionMeta,
  KernelMessage,
} from '@difizen/libro-jupyter';
import {
  CellEditorMemo,
  CellService,
  CodeEditorManager,
  JupyterCodeCellView,
  KernelError,
} from '@difizen/libro-jupyter';
import {
  getOrigin,
  inject,
  prop,
  transient,
  useInject,
  view,
  ViewInstance,
  ViewManager,
  ViewOption,
} from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { message } from 'antd';
import { isUndefined } from 'lodash-es';
import { forwardRef } from 'react';

import { Ribbon } from '@/components/ribbon';
import { SecretNoteKernelManager } from '@/modules/kernel';
import { SecretNoteServerManager, ServerStatus } from '@/modules/server';
import { compareDateString } from '@/utils';
import type { SecretNoteModel } from '../model';

const SecretNoteCodeCellComponent = forwardRef<HTMLDivElement>((props, ref) => {
  const instance = useInject<SecretNoteCodeCellView>(ViewInstance);
  const { partyList, parties } = instance;

  return (
    <div className={instance.className} ref={ref} tabIndex={10} onBlur={instance.blur}>
      <Ribbon
        items={partyList.map((name) => ({ label: name, key: name }))}
        value={parties}
        onChange={(val) => instance.onPartiesChange(val)}
      >
        <CellEditorMemo />
      </Ribbon>
    </div>
  );
});
SecretNoteCodeCellComponent.displayName = 'SecretNoteCodeCellComponent';

let lastParties: string[] = []; // store last parties for new cell

@transient()
@view('secretnote-code-cell-view')
export class SecretNoteCodeCellView extends JupyterCodeCellView {
  private readonly serverManager: SecretNoteServerManager;
  private readonly kernelManager: SecretNoteKernelManager;

  view = SecretNoteCodeCellComponent;

  @prop() parties: string[] = [];

  get partyList() {
    return this.serverManager.servers
      .filter((s) => s.status === ServerStatus.Succeeded)
      .map((server) => server.name);
  }

  constructor(
    @inject(ViewOption) options: CellViewOptions,
    @inject(CellService) cellService: CellService,
    @inject(ViewManager) viewManager: ViewManager,
    @inject(CodeEditorManager) codeEditorManager: CodeEditorManager,
    @inject(SecretNoteServerManager) serverManager: SecretNoteServerManager,
    @inject(SecretNoteKernelManager) kernelManager: SecretNoteKernelManager,
  ) {
    super(options, cellService, viewManager, codeEditorManager);
    this.serverManager = serverManager;
    this.kernelManager = kernelManager;
    this.parties = this.getInitialParties();
  }

  /**
   * Get usable kernel connections for the cell to execute.
   */
  getUsableKernels() {
    const libroModel = this.parent.model as unknown as SecretNoteModel;
    if (!libroModel) {
      return [];
    }

    return getOrigin(libroModel.kernelConnections).filter((connection) => {
      if (connection.isDisposed) {
        return false;
      }
      const server = this.kernelManager.getServerByKernelConnection(connection);
      return (
        server &&
        server.status === ServerStatus.Succeeded &&
        this.parties.includes(server.name)
      );
    });
  }

  /**
   * Execute a single cell.
   */
  async run() {
    const cellModel = this.model;
    const kernels = this.getUsableKernels();
    if (kernels.length === 0) {
      message.info(l10n.t('无可用的 Kernel 连接，请检查是否存在并选中可用节点'));
      return false;
    }

    this.clearExecution(); // clear the previous execution output area
    this.updateExecutionStatus({ executing: true }); // mark the cell as executing
    this.updateExecutionTime({
      toExecute: new Date().toISOString(), // record the time when execution is fired
    });
    this.savePartiesToMeta(); // ensure the parties are saved to the cell metadata

    try {
      const futures: Promise<KernelMessage.IExecuteReplyMsg>[] = [];

      // dispatch the code to all usable kernels
      kernels.forEach((kernel) => {
        const future = kernel.requestExecute(
          {
            code: cellModel.value,
          },
          /* disposeOnDone */ true,
        );
        // handle IOPub messages
        future.onIOPub = (
          msg: KernelMessage.IIOPubMessage<KernelMessage.IOPubMessageType>,
        ) => {
          if (msg.header.msg_type === 'execute_input') {
            // the execution request is accpeted by the kernel and started to execute
            this.updateExecutionStatus({ kernelExecuting: true });
            this.updateExecutionTime({ start: msg.header.date });
          }
          // This event will be handled inside `output/outputarea.tsx`
          cellModel.msgChangeEmitter.fire({
            kernel,
            msg,
          });
        };
        // handle Reply messages
        future.onReply = (msg: KernelMessage.IExecuteReplyMsg) => {
          // This event will be handled inside `output/outputarea.tsx`
          cellModel.msgChangeEmitter.fire({
            kernel,
            msg,
          });
        };
        // store the done signal
        futures.push(future.done);
      });

      // wait for all kernels to finish the execution and update corresponding status
      const presents = await Promise.all(futures);
      this.updateExecutionStatus({ executing: false, kernelExecuting: false });
      this.updateExecutionTime(this.parseMessagesTimeRange(presents));

      // check if all kernels finish the execution successfully
      const notOks = presents.filter((msg) => msg.content.status !== 'ok');
      if (notOks.length === 0) {
        return true;
      } else {
        // TODO: handle all the error messages
        const errors = presents.filter((msg) => msg.content.status !== 'ok');
        if (errors) {
          throw new KernelError(errors[0].content);
        }
        return false;
      }
    } catch (e) {
      if (e instanceof Error && e.message.startsWith('Canceled')) {
        return false;
      }

      throw e;
    }
  }

  /**
   * Update the execution status of the cell.
   * `executing` means the application is executing the cell.
   * `kernelExecuting` means some kernel is executing the cell.
   */
  updateExecutionStatus(status: { executing?: boolean; kernelExecuting?: boolean }) {
    const { executing, kernelExecuting } = status;
    !isUndefined(executing) && (this.model.executing = executing);
    !isUndefined(kernelExecuting) && (this.model.kernelExecuting = kernelExecuting);
  }

  /**
   * Update the execution time of the cell.
   * `toExecute` is the time when the execution request is sent to the kernel by the application.
   * `start` is the time when the kernel starts to execute the code.
   * `end` is the time when the kernel finishes the execution.
   */
  updateExecutionTime(times: { toExecute?: string; start?: string; end?: string }) {
    const meta = this.model.metadata.execution as ExecutionMeta;
    if (meta) {
      const { start, end, toExecute } = times;
      if (!isUndefined(start)) {
        meta['shell.execute_reply.started'] = start;
      }
      if (!isUndefined(end)) {
        meta['shell.execute_reply.end'] = end;
      }
      if (!isUndefined(toExecute)) {
        meta.to_execute = toExecute;
      }
    }
  }

  /**
   * Parse the execution time from a section of Websocket messages.
   */
  parseMessagesTimeRange(msgs: KernelMessage.IExecuteReplyMsg[]) {
    let start = '',
      end = '';
    msgs.forEach((msg) => {
      const startTime = msg.metadata.started as string;
      const endTime = msg.header.date;
      if (start === '' || compareDateString(startTime, start) < 0) {
        start = startTime;
      }
      if (end === '' || compareDateString(endTime, end) > 0) {
        end = endTime;
      }
    });

    return { start, end };
  }

  /**
   * Handle the change of parties user selected on the right-top corner of the cell.
   */
  onPartiesChange(parties: string[]) {
    this.parties = parties;
    this.savePartiesToMeta(parties);
    lastParties = parties;
  }

  /**
   * Get the initialization value of parties for a cell.
   * If the cell has been executed before, return those saved in the cell metadata.
   * If can't, return the previous cell's parties.
   * If still can't, all parties will be returned.
   */
  getInitialParties() {
    const execution = this.model.metadata.execution as ExecutionMeta;
    if (execution && execution.parties) {
      try {
        const parties: string[] = JSON.parse(execution.parties as string);
        return parties.filter((p) => this.partyList.includes(p));
      } catch (e) {
        return [];
      }
    } else if (lastParties.length > 0) {
      return lastParties; // load parties from previous cell settings
    }
    return this.partyList;
  }

  /**
   * Save the parties user selected to the cell model metadata.
   */
  savePartiesToMeta(parties = this.parties) {
    const execution = this.model.metadata.execution as ExecutionMeta;
    if (execution) {
      execution.parties = JSON.stringify(parties);
    } else {
      this.model.metadata.execution = {
        parties: JSON.stringify(parties),
      };
    }
  }
}
