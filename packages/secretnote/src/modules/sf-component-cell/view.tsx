import type {
  BaseOutputArea,
  KernelMessage,
  ExecutionMeta,
} from '@difizen/libro-jupyter';
import {
  LibroExecutableCellView,
  KernelError,
  isDisplayDataMsg,
  isErrorMsg,
  isExecuteResultMsg,
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
import { Cascader, Tabs, type TabsProps, Empty } from 'antd';
import { message } from 'antd';
import { groupBy } from 'lodash-es';
import { forwardRef, useState } from 'react';

import { ComponentSpecPanel } from '@/components/component-spec-panel';
import type { ComponentSpec } from '@/components/component-spec-panel';
import LogView from '@/components/log-viewer';
import type { SecretNoteModel } from '@/modules/editor';
import { compareDateString } from '@/utils';

import componentsData from './component.json';
import type { SFComponentCellModel } from './model';
import { getCode } from './psi-code-mock';
import './index.less';

type ComponentSpecOptions = {
  label: string;
  value: string;
  children: ComponentSpecOptions[];
  component?: ComponentSpec;
};

const transformComponentsToOptions = (componentSpecs: ComponentSpec[]) => {
  const options: ComponentSpecOptions[] = [];
  const componentByDomain = groupBy(componentSpecs, 'domain');
  Object.keys(componentByDomain).forEach((domain) => {
    const domainComponents = componentByDomain[domain];
    const domainOptions: ComponentSpecOptions = {
      value: domain,
      label: domain,
      children: [],
    };

    const componentByName = groupBy(domainComponents, 'name');
    Object.keys(componentByName).forEach((name) => {
      const nameComponents = componentByName[name];
      const nameOptions: ComponentSpecOptions = {
        value: name,
        label: name,
        children: [],
      };

      nameComponents.forEach((component) => {
        nameOptions.children.push({
          value: component.version,
          label: component.version,
          component,
          children: [],
        });
      });

      domainOptions.children.push(nameOptions);
    });

    options.push(domainOptions);
  });

  return options;
};

export const SFComponentCellComponent = forwardRef<HTMLDivElement>((props, ref) => {
  const instance = useInject<SFComponentCellView>(ViewInstance);
  const [componentSpec, setComponentSpec] = useState<ComponentSpec>();

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Log',
      children: (
        <div className="sf-component-log">
          {instance.logs.length > 0 ? (
            <LogView code={instance.logs} theme="light" />
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
        <Cascader
          size="small"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          options={transformComponentsToOptions(componentsData.comps as any)}
          onChange={(value, selectedOptions) => {
            setComponentSpec(selectedOptions?.[selectedOptions.length - 1]?.component);
          }}
          placeholder="Please select a component first"
        />
      </div>
      <div className="body">
        <div className="config">
          {componentSpec ? (
            <ComponentSpecPanel
              title={
                componentSpec
                  ? `${componentSpec.domain}/${componentSpec.name}:${componentSpec.version}`
                  : ''
              }
              specs={componentSpec}
              onChange={(changedValue, fullValue) => {
                instance.toExecuteCode = getCode(fullValue);
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
export class SFComponentCellView extends LibroExecutableCellView {
  view = SFComponentCellComponent;
  // Only with outputArea can the Execute button on the right appear. This could be libro's bug
  outputArea = { outputs: [] } as unknown as BaseOutputArea;

  @prop()
  toExecuteCode = '';

  @prop()
  logs = '';

  get cellModel() {
    return this.model as SFComponentCellModel;
  }

  async run() {
    const libroModel = this.parent.model as SecretNoteModel;

    if (!libroModel) {
      return false;
    }

    const kernelConnections = getOrigin(libroModel.kernelConnections);
    if (kernelConnections.length === 0) {
      message.info(l10n.t('没有可用的 Kernel 连接'));
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

    try {
      const list: Promise<KernelMessage.IExecuteReplyMsg>[] = [];
      for (let i = 0, len = kernelConnections.length; i < len; i += 1) {
        const connection = kernelConnections[i];

        const future = connection.requestExecute({
          code: this.toExecuteCode,
        });

        future.onIOPub = (
          msg: KernelMessage.IIOPubMessage<KernelMessage.IOPubMessageType>,
        ) => {
          this.handleMessages(msg);
          if (
            this.cellModel.kernelExecuting === false &&
            msg.header.msg_type === 'execute_input'
          ) {
            this.setExecutionStatus({ kernelExecuting: true });
            this.setExecutionTime({ start: msg.header.date });
          }
        };

        future.onReply = (msg: KernelMessage.IExecuteReplyMsg) => {
          //
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

  handleMessages(msg: KernelMessage.IMessage) {
    if (
      isDisplayDataMsg(msg) ||
      isStreamMsg(msg) ||
      isErrorMsg(msg) ||
      isExecuteResultMsg(msg)
    ) {
      //const wrap = this.logs === '' ? '' : '\n';
      this.logs += msg.content.text;
    }
  }

  setExecutionStatus(status: { executing?: boolean; kernelExecuting?: boolean }) {
    const { executing, kernelExecuting } = status;
    if (executing !== undefined) {
      this.cellModel.executing = executing;
    }
    if (kernelExecuting !== undefined) {
      this.cellModel.kernelExecuting = kernelExecuting;
    }
  }

  setExecutionTime(times: { start?: string; end?: string; toExecute?: string }) {
    const meta = this.cellModel.metadata.execution as ExecutionMeta;
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
