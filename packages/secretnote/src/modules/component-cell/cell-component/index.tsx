import { Tabs, type TabsProps, Empty } from 'antd';
import { useState } from 'react';

import type { ComponentSpec, Value } from '@/components/component-spec-form';
import { ComponentSpecForm } from '@/components/component-spec-form';
import LogView from '@/components/log-viewer';

import { ComponentOptions } from './options';
import './index.less';

const getComponentTitle = (component: ComponentSpec) => {
  return `${component.domain}/${component.name}:${component.version}`;
};

interface CellComponentProps {
  log: string;
  onComponentChange: (component: ComponentSpec) => void;
  onComponentConfigChange: (config: Value) => void;
}

const CellComponent = (props: CellComponentProps) => {
  const [component, setComponent] = useState<ComponentSpec>();

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Log',
      children: (
        <div className="sf-component-log">
          {props.log ? (
            <LogView code={props.log} theme="light" />
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
    <div className="component-cell-container">
      <div className="header">
        <span>component:</span>
        <ComponentOptions
          onComponentChange={(c) => {
            setComponent(c);
            props.onComponentChange(c);
          }}
        />
      </div>
      <div className="body">
        <div className="config">
          {component ? (
            <ComponentSpecForm
              title={getComponentTitle(component)}
              specs={component}
              onChange={(changedValue, fullValue) => {
                props.onComponentConfigChange(fullValue);
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
};

export { CellComponent };
