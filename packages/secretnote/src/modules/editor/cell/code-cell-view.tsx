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
import { forwardRef } from 'react';

import { Ribbon } from '@/components/ribbon';
import { SecretNoteKernelManager } from '@/modules/kernel';
import { SecretNoteServerManager } from '@/modules/server';
import { compareDateString } from '@/utils';

import type { SecretNoteModel } from '../model';

const SecretNoteCodeCellComponent = forwardRef<HTMLDivElement>((props, ref) => {
  const instance = useInject<SecretNoteCodeCellView>(ViewInstance);
  const { allExecutionParty, executionParty } = instance;

  return (
    <div className={instance.className} ref={ref} tabIndex={10} onBlur={instance.blur}>
      <Ribbon
        items={allExecutionParty}
        value={executionParty}
        onChange={(val) => {
          instance.changeExecutionParty(val);
        }}
      >
        <CellEditorMemo />
      </Ribbon>
    </div>
  );
});
SecretNoteCodeCellComponent.displayName = 'SecretNoteCodeCellComponent';

@transient()
@view('secretnote-code-cell-view')
export class SecretNoteCodeCellView extends JupyterCodeCellView {
  private readonly serverManager: SecretNoteServerManager;
  private readonly kernelManager: SecretNoteKernelManager;

  view = SecretNoteCodeCellComponent;

  @prop()
  executionParty: string[] = [];

  get allExecutionParty() {
    return this.serverManager.servers.map((server) => ({
      key: server.id,
      label: server.name,
    }));
  }

  constructor(
    @inject(ViewOption) options: CellViewOptions,
    @inject(CellService) cellService: CellService,
    @inject(ViewManager) viewManager: ViewManager,
    @inject(SecretNoteServerManager) serverManager: SecretNoteServerManager,
    @inject(SecretNoteKernelManager) kernelManager: SecretNoteKernelManager,
  ) {
    super(options, cellService, viewManager);
    this.serverManager = serverManager;
    this.kernelManager = kernelManager;
    this.executionParty =
      this.getExecutionParty() || this.allExecutionParty.map((item) => item.key);
  }

  async run() {
    const libroModel = this.parent.model as SecretNoteModel;
    const cellModel = this.model;

    if (!libroModel) {
      return false;
    }

    let kernelConnections = getOrigin(libroModel.kernelConnections);

    // 没有可用的 Kernel 连接
    if (kernelConnections.length === 0) {
      message.info(l10n.t('没有可用的 Kernel 连接'));
      return false;
    }

    kernelConnections = kernelConnections.filter((connection) => {
      const server = this.kernelManager.getServerByKernelConnection(connection);
      return (
        server && server.status === 'running' && this.executionParty.includes(server.id)
      );
    });
    if (kernelConnections.length === 0) {
      message.info(l10n.t('请选择一个执行节点'));
      return false;
    }
    if (kernelConnections.length !== this.executionParty.length) {
      message.info(l10n.t('有的 Kernel 连接不可用'));
      return false;
    }

    const hasDisposedConnection = kernelConnections.some((item) => {
      return item.isDisposed;
    });
    if (hasDisposedConnection) {
      message.error(l10n.t('有的 Kernel 连接已经被销毁'));
      return false;
    }

    this.clearExecution();
    this.setExecutionStatus({ executing: true });
    this.setExecutionTime({ start: '', end: '', toExecute: new Date().toISOString() });
    this.setExecutionParty();

    try {
      const list: Promise<KernelMessage.IExecuteReplyMsg>[] = [];
      for (let i = 0, len = kernelConnections.length; i < len; i += 1) {
        const connection = kernelConnections[i];

        const future = connection.requestExecute({
          code: cellModel.value,
        });

        future.onIOPub = (
          msg: KernelMessage.IIOPubMessage<KernelMessage.IOPubMessageType>,
        ) => {
          cellModel.msgChangeEmitter.fire({
            connection,
            msg,
          });
          if (
            cellModel.kernelExecuting === false &&
            msg.header.msg_type === 'execute_input'
          ) {
            this.setExecutionStatus({ kernelExecuting: true });
            this.setExecutionTime({ start: msg.header.date });
          }
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
      this.setExecutionStatus({ executing: false, kernelExecuting: false });
      this.setExecutionTime(this.parseMessageTime(futureDoneList));

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

  setExecutionStatus(status: { executing?: boolean; kernelExecuting?: boolean }) {
    const { executing, kernelExecuting } = status;
    if (executing !== undefined) {
      this.model.executing = executing;
    }
    if (kernelExecuting !== undefined) {
      this.model.kernelExecuting = kernelExecuting;
    }
  }

  setExecutionTime(times: { start?: string; end?: string; toExecute?: string }) {
    const meta = this.model.metadata.execution as ExecutionMeta;
    if (meta) {
      const { start, end, toExecute } = times;
      if (start !== undefined) {
        meta['shell.execute_reply.started'] = start;
      }
      if (end !== undefined) {
        meta['shell.execute_reply.end'] = end;
      }
      if (toExecute !== undefined) {
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

  changeExecutionParty(party: string[]) {
    this.executionParty = party;
    this.setExecutionParty(party);
  }

  getExecutionParty() {
    const execution = this.model.metadata.execution as ExecutionMeta;
    if (execution && execution.executionParty) {
      try {
        const party: string[] = JSON.parse(execution.executionParty as string);
        return party.filter((p) =>
          this.allExecutionParty.some((item) => item.key === p),
        );
      } catch (e) {
        return [];
      }
    }
  }

  setExecutionParty(party: string[] = this.executionParty) {
    const execution = this.model.metadata.execution as ExecutionMeta;
    if (execution) {
      execution.executionParty = JSON.stringify(party);
    }
  }
}
