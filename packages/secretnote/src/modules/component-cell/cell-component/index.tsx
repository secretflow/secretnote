import { Tabs, type TabsProps, Empty } from 'antd';
import { type FormInstance } from 'antd/es/form';
import { useRef, useState } from 'react';

import { ComponentForm } from '@/components/component-form';
import type { ComponentSpec, Value } from '@/components/component-spec-form';
import LogView from '@/components/log-viewer';

import { ComponentOptions } from './options';
import './index.less';

interface CellComponentProps {
  logs: string[];
  onComponentChange: (component: ComponentSpec) => void;
  onComponentConfigChange: (config: Value) => void;
}

const CellComponent = (props: CellComponentProps) => {
  const [component, setComponent] = useState<ComponentSpec>();
  const formRef = useRef<FormInstance>(null);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Log',
      children: (
        <div className="sf-component-log">
          {props.logs.length > 0 ? (
            <LogView code={props.logs} theme="light" />
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
            <ComponentForm
              config={component}
              ref={formRef}
              value={{
                protocol: 'ECDH_PSI_2PC',
                sort: true,
                bucket_size: '1048576',
                ecdh_curve_type: 'CURVE_SM2',
                input: {
                  receiver_input: {
                    type: 'sf.table.individual',
                    tables: {
                      data_ref: [
                        {
                          uri: 'iris_alice.csv',
                          party: 'alice',
                        },
                      ],
                      schema: {
                        ids: ['id1,id2'],
                        id_types: ['str,str'],
                      },
                    },
                  },
                  sender_input: {},
                },
                'input/receiver_input/key': 'uid',
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
