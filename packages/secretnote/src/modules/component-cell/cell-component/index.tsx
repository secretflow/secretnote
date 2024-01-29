import type { IOutput } from '@difizen/libro-jupyter';
import { Tabs, type TabsProps, Empty, Spin } from 'antd';
import { forwardRef, type ForwardedRef, useMemo } from 'react';

import { ComponentForm } from '@/components/component-form';
import type { ComponentSpec, Value } from '@/components/component-form';
import LogView from '@/components/log-viewer';

import { generateComponentCellCode } from './cell-code';
import { ComponentOptions, getComponentByIds, getComponentIds } from './options';
import './index.less';

interface CellComponentProps {
  component?: ComponentSpec;
  onComponentChange?: (component: ComponentSpec) => void;
  defaultComponentConfig?: Value;
  onComponentConfigChange?: (changedValues: Value, values: Value) => void;
  outputs: IOutput[];
  loading?: boolean;
}

const CellComponent = forwardRef(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (props: CellComponentProps, ref: ForwardedRef<any>) => {
    const {
      component,
      onComponentChange,
      defaultComponentConfig,
      onComponentConfigChange,
      outputs,
      loading,
    } = props;

    const outputLogs = useMemo(() => {
      const logs: string[] = [];
      outputs.forEach((output) => {
        if (output.output_type === 'stream') {
          if (output.text) {
            logs.push(output.text as string);
          }
        } else if (output.output_type === 'error') {
          if (output.traceback) {
            logs.push((output.traceback as string[]).join(''));
          }
        }
      });

      return <LogView code={logs} theme="light" />;
    }, [outputs]);

    const items: TabsProps['items'] = [
      {
        key: '1',
        label: 'Log',
        children: (
          <div className="sf-component-log">
            {loading ? (
              <div className="loading">
                <Spin />
              </div>
            ) : (
              outputLogs
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
      <div className="component-cell-container">
        <div className="header">
          <span>component:</span>
          <ComponentOptions
            component={component}
            onComponentChange={(c) => {
              if (onComponentChange) {
                onComponentChange(c);
              }
            }}
          />
        </div>
        <div className="body">
          <div className="config">
            {component ? (
              <ComponentForm
                config={component}
                ref={ref}
                defaultValue={defaultComponentConfig}
                onValuesChange={onComponentConfigChange}
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
  },
);
CellComponent.displayName = 'CellComponent';

export { CellComponent, getComponentByIds, getComponentIds, generateComponentCellCode };
