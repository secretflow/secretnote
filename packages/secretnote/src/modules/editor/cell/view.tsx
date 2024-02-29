import type {
  ExecutionMeta,
  KernelMessage,
  CellViewOptions,
} from '@difizen/libro-jupyter';
import {
  CellEditorMemo,
  CellService,
  JupyterCodeCellView,
  KernelError,
  ILSPDocumentConnectionManager,
  CodeEditorManager,
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
import { SecretNoteServerManager } from '@/modules/server';
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
        onChange={(val) => {
          instance.onPartiesChange(val);
        }}
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

  @prop()
  parties: string[] = [];

  get partyList() {
    return this.serverManager.servers.map((server) => server.name);
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
    this.parties = this.getInitializedParties();
  }

  getUsableConnections() {
    const libroModel = this.parent.model as SecretNoteModel;

    if (!libroModel) {
      return [];
    }

    const kernelConnections = getOrigin(libroModel.kernelConnections);

    return kernelConnections.filter((connection) => {
      if (connection.isDisposed) {
        return false;
      }
      const server = this.kernelManager.getServerByKernelConnection(connection);
      return (
        server && server.status === 'running' && this.parties.includes(server.name)
      );
    });
  }

  async run() {
    const cellModel = this.model;
    const kernelConnections = this.getUsableConnections();

    if (kernelConnections.length === 0) {
      message.info(l10n.t('No available node to execute'));
      return false;
    }

    this.clearExecution();
    this.updateExecutionStatus({ executing: true });
    this.updateExecutionTime({
      toExecute: new Date().toISOString(),
    });
    this.savePartiesToMeta();

    try {
      const list: Promise<KernelMessage.IExecuteReplyMsg>[] = [];
      for (let i = 0, len = kernelConnections.length; i < len; i += 1) {
        const connection = kernelConnections[i];
        const future = connection.requestExecute(
          {
            code: cellModel.value,
          },
          // Even after receiving a reply message, you can still receive other messages.
          false,
        );

        future.onIOPub = (
          msg: KernelMessage.IIOPubMessage<KernelMessage.IOPubMessageType>,
        ) => {
          if (msg.header.msg_type === 'execute_input') {
            this.updateExecutionStatus({ kernelExecuting: true });
            this.updateExecutionTime({ start: msg.header.date });
          }
          cellModel.msgChangeEmitter.fire({
            connection,
            msg,
          });
        };

        future.onReply = (msg: KernelMessage.IExecuteReplyMsg) => {
          cellModel.msgChangeEmitter.fire({
            connection,
            msg,
          });
        };

        list.push(future.done);
      }

      const futureDoneList = await Promise.all(list);
      this.updateExecutionStatus({ executing: false, kernelExecuting: false });
      this.updateExecutionTime(this.parseMessageTime(futureDoneList));

      const ok = futureDoneList.every((msg) => msg.content.status === 'ok');
      if (ok) {
        return true;
      } else {
        const error = futureDoneList.find((msg) => msg.content.status !== 'ok');
        if (error) {
          throw new KernelError(error.content);
        }
        return false;
      }
    } catch (reason) {
      if (reason instanceof Error && reason.message.startsWith('Canceled')) {
        return false;
      }
      throw reason;
    }
  }

  updateExecutionStatus(status: { executing?: boolean; kernelExecuting?: boolean }) {
    const { executing, kernelExecuting } = status;
    if (!isUndefined(executing)) {
      this.model.executing = executing;
    }
    if (!isUndefined(kernelExecuting)) {
      this.model.kernelExecuting = kernelExecuting;
    }
  }

  updateExecutionTime(times: { start?: string; end?: string; toExecute?: string }) {
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

  parseMessageTime(msgs: KernelMessage.IExecuteReplyMsg[]) {
    let start = '';
    let end = '';
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

  onPartiesChange(parties: string[]) {
    this.parties = parties;
    this.savePartiesToMeta(parties);
    lastParties = parties;
  }

  getInitializedParties() {
    const execution = this.model.metadata.execution as ExecutionMeta;
    if (execution && execution.parties) {
      try {
        const parties: string[] = JSON.parse(execution.parties as string);
        return parties.filter((p) => this.partyList.includes(p));
      } catch (e) {
        return [];
      }
    } else if (lastParties.length > 0) {
      // load parties from previous cell settings
      return lastParties;
    }
    return this.partyList;
  }

  savePartiesToMeta(parties: string[] = this.parties) {
    const execution = this.model.metadata.execution as ExecutionMeta;
    if (execution) {
      execution.parties = JSON.stringify(parties);
    }
  }
}
