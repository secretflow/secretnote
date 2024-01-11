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
import { Tabs, type TabsProps, Empty } from 'antd';
import { message } from 'antd';
import { forwardRef } from 'react';

import { ComponentSpecForm } from '@/components/component-spec-form';
import type { ComponentSpec, Value } from '@/components/component-spec-form';
import LogView from '@/components/log-viewer';
import type { SecretNoteModel } from '@/modules/editor';

import { codeTemplate } from './code-template';
import { ComponentOptions, getComponentTitle } from './componet-option';
import type { ComponentCellModel } from './model';
import './index.less';

export const SFComponentCellComponent = forwardRef<HTMLDivElement>((props, ref) => {
  const instance = useInject<ComponentCellView>(ViewInstance);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Log',
      children: (
        <div className="sf-component-log">
          {instance.log ? (
            <LogView code={instance.log} theme="light" />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No log." />
          )}
        </div>
      ),
    },
    {
      key: '2',
      label: 'Report',
      children: (
        <div className="sf-component-report">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No report." />
        </div>
      ),
    },
  ];

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
      <div className="header">
        <span>component:</span>
        <ComponentOptions
          onComponentSpecChange={(spec) => (instance.componentSpec = spec)}
        />
      </div>
      <div className="body">
        <div className="config">
          {instance.componentSpec ? (
            <ComponentSpecForm
              title={
                instance.componentSpec ? getComponentTitle(instance.componentSpec) : ''
              }
              specs={instance.componentSpec}
              onChange={(changedValue, fullValue) => {
                instance.componentConfigValue = fullValue;
              }}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Select a component first."
              style={{ marginTop: 120 }}
            />
          )}
        </div>
        <div className="result">
          <Tabs defaultActiveKey="1" items={items} size="small" />
        </div>
      </div>
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
  componentSpec: ComponentSpec | undefined;

  @prop()
  componentConfigValue: Value = {};

  @prop()
  log = '';

  get running() {
    return this.cellModel.executing;
  }

  get cellModel() {
    return this.model as ComponentCellModel;
  }

  async run() {
    const kernelConnections = this.getKernelConnections();

    if (kernelConnections.length === 0) {
      return false;
    }

    if (!this.componentSpec) {
      message.error(l10n.t('Please select a component first.'));
      return false;
    }

    this.clearExecution();
    this.log = 'Start executing...\n';

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
      const text = msg.content.text || '';
      this.log = text;
    } else if (isErrorMsg(msg)) {
      this.log = msg.content.traceback.join('');
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
