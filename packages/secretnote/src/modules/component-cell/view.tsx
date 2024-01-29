import type {
  BaseOutputArea,
  KernelMessage,
  IOutput,
  CellViewOptions,
} from '@difizen/libro-jupyter';
import {
  LibroExecutableCellView,
  KernelError,
  CellService,
  DocumentCommands,
  isStreamMsg,
  isErrorMsg,
} from '@difizen/libro-jupyter';
import {
  transient,
  useInject,
  view,
  ViewInstance,
  getOrigin,
  prop,
  inject,
  CommandRegistry,
  ViewOption,
} from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { message } from 'antd';
import { forwardRef } from 'react';

import type { ComponentSpec, Value } from '@/components/component-form';
import type { SecretNoteModel } from '@/modules/editor';

import { CellComponent, getComponentByIds, getComponentIds } from './cell-component';
import { generateComponentCode } from './generate-code';
import type { ComponentCellModel, ComponentMetadata } from './model';

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
        outputs={instance.cellModel.outputs}
        component={instance.component}
        onComponentChange={(c) => {
          instance.onComponentChange(c);
        }}
        defaultComponentConfig={instance.defaultComponentConfig}
        onComponentConfigChange={(changeValues, values) => {
          instance.onComponentConfigChange(values);
        }}
      />
    </div>
  );
});
SFComponentCellComponent.displayName = 'SFComponentCellComponent';

@transient()
@view('sf-component-cell-view')
export class ComponentCellView extends LibroExecutableCellView {
  view = SFComponentCellComponent;
  private commandRegistry: CommandRegistry;

  // Only with outputArea can the Execute button on the right appear. This could be libro's bug
  outputArea = { outputs: [] } as unknown as BaseOutputArea;

  @prop()
  component: ComponentSpec | undefined;

  @prop()
  componentConfigValue: Value | undefined;

  @prop()
  defaultComponentConfig: Value | undefined;

  get cellModel() {
    return this.model as ComponentCellModel;
  }

  constructor(
    @inject(ViewOption) options: CellViewOptions,
    @inject(CellService) cellService: CellService,
    @inject(CommandRegistry) commandRegistry: CommandRegistry,
  ) {
    super(options, cellService);
    this.commandRegistry = commandRegistry;
  }

  onViewMount() {
    const meta = this.cellModel.metadata as ComponentMetadata;
    if (meta.component) {
      const { id, params } = meta.component;
      this.component = getComponentByIds(id);
      this.defaultComponentConfig = params;
      this.componentConfigValue = params;
    }
  }

  onComponentChange = (c: ComponentSpec) => {
    this.component = c;
    this.componentConfigValue = {};
    this.cellModel.outputs = [];

    this.cellModel.metadata.component = {
      id: getComponentIds(c),
      params: {},
    };
    this.cellModel.outputs = [];
  };

  onComponentConfigChange = (v: Value) => {
    this.componentConfigValue = v;
    const metadata = this.cellModel.metadata as ComponentMetadata;
    if (metadata && metadata.component) {
      metadata.component.params = v;
    }
    this.save();
  };

  save() {
    this.commandRegistry.executeCommand(DocumentCommands.Save.id);
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
    this.cellModel.outputs = [];

    try {
      this.cellModel.executing = true;
      const list: Promise<KernelMessage.IExecuteReplyMsg>[] = [];

      for (let i = 0, len = kernelConnections.length; i < len; i += 1) {
        const connection = kernelConnections[i];

        const future = connection.requestExecute({
          code: generateComponentCode(this.component, this.componentConfigValue),
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
        this.save();
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
    if (isStreamMsg(msg) || isErrorMsg(msg)) {
      const output: IOutput = {
        ...msg.content,
        output_type: msg.header.msg_type,
      };
      this.cellModel.outputs = [...this.cellModel.outputs, output];
    }
  }

  toJSON() {
    return {
      id: this.cellModel.id,
      cell_type: 'component',
      source: generateComponentCode(this.component, this.componentConfigValue),
      metadata: this.cellModel.metadata,
      outputs: this.cellModel.outputs,
    };
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
