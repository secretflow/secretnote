import type { BaseOutputArea, KernelMessage } from '@difizen/libro-jupyter';
import {
  LibroExecutableCellView,
  KernelError,
  isErrorMsg,
  isStreamMsg,
} from '@difizen/libro-jupyter';
import {
  transient,
  useInject,
  view,
  ViewInstance,
  getOrigin,
  prop,
} from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { message } from 'antd';
import { forwardRef } from 'react';

import type { ComponentSpec, Value } from '@/components/component-spec-form';
import type { SecretNoteModel } from '@/modules/editor';

import { CellComponent } from './cell-component';
import { codeTemplate } from './code-template';
import type { ComponentCellModel } from './model';

export const SFComponentCellComponent = forwardRef<HTMLDivElement>((props, ref) => {
  const instance = useInject<ComponentCellView>(ViewInstance);

  return (
    <div
      tabIndex={10}
      ref={ref}
      className="sf-component-container"
      onFocus={() => {
        instance.focus(true);
      }}
      onBlur={(e) => {
        if (typeof ref !== 'function' && !ref?.current?.contains(e.relatedTarget)) {
          instance.blur();
        }
      }}
    >
      <CellComponent
        logs={instance.logs}
        onComponentChange={(c) => (instance.component = c)}
        onComponentConfigChange={(v) => (instance.componentConfigValue = v)}
      />
    </div>
  );
});
SFComponentCellComponent.displayName = 'SFComponentCellComponent';

@transient()
@view('sf-component-cell-view')
export class ComponentCellView extends LibroExecutableCellView {
  view = SFComponentCellComponent;
  // Only with outputArea can the Execute button on the right appear. This could be libro's bug
  outputArea = { outputs: [] } as unknown as BaseOutputArea;

  @prop()
  component: ComponentSpec | undefined;

  @prop()
  componentConfigValue: Value = {};

  @prop()
  logs: string[] = [];

  get cellModel() {
    return this.model as ComponentCellModel;
  }

  async run() {
    const kernelConnections = this.getKernelConnections();

    if (kernelConnections.length === 0) {
      return false;
    }

    if (!this.component) {
      message.error(l10n.t('Please select a component first.'));
      return false;
    }

    this.clearExecution();
    this.logs = [];

    try {
      this.cellModel.executing = true;
      const list: Promise<KernelMessage.IExecuteReplyMsg>[] = [];

      for (let i = 0, len = kernelConnections.length; i < len; i += 1) {
        const connection = kernelConnections[i];

        const future = connection.requestExecute({
          code: codeTemplate,
        });

        future.onIOPub = (msg: KernelMessage.IIOPubMessage) => {
          this.handleMessages(msg);
          if (msg.header.msg_type === 'execute_input') {
            this.cellModel.kernelExecuting = true;
          }
        };

        future.onReply = (msg: KernelMessage.IExecuteReplyMsg) => {
          this.handleMessages(msg);
        };

        list.push(future.done);
      }

      const futureDoneList = await Promise.all(list);

      this.cellModel.kernelExecuting = false;
      this.cellModel.executing = false;

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

  getKernelConnections() {
    const libroModel = this.parent.model as SecretNoteModel;

    if (!libroModel) {
      return [];
    }

    return getOrigin(libroModel.kernelConnections);
  }

  handleMessages(msg: KernelMessage.IIOPubMessage | KernelMessage.IExecuteReplyMsg) {
    if (isStreamMsg(msg)) {
      this.logs = [...this.logs, msg.content.text];
    } else if (isErrorMsg(msg)) {
      this.logs = [...this.logs, msg.content.traceback.join('')];
    }
  }

  focus(toEdit: boolean) {
    if (toEdit) {
      this.cellModel.isEdit = true;
    }
  }

  blur() {
    this.cellModel.isEdit = false;
  }

  shouldEnterEditorMode() {
    return this.cellModel.isEdit;
  }
}
