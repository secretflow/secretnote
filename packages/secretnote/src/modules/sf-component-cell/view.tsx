import type { BaseOutputArea } from '@difizen/libro-jupyter';
import { LibroExecutableCellView } from '@difizen/libro-jupyter';
import { transient, useInject, view, ViewInstance } from '@difizen/mana-app';
import { Cascader, Tabs, type TabsProps, Empty } from 'antd';
import { forwardRef } from 'react';

import { ComponentSpecPanel } from '@/components/component-spec-panel';

import data from './mock.json';
import type { SFComponentCellModel } from './model';
import './index.less';

const options = [
  {
    value: 'preprocessing',
    label: 'preprocessing',
    children: [
      {
        value: 'psi',
        label: 'psi',
        children: [
          {
            value: '0.01',
            label: '0.01',
          },
        ],
      },
    ],
  },
];

export const SFComponentCellComponent = forwardRef<HTMLDivElement>((props, ref) => {
  const instance = useInject<SFComponentCellView>(ViewInstance);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Result',
      children: (
        <div className="sf-component-result">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No result." />
        </div>
      ),
    },
    {
      key: '2',
      label: 'Log',
      children: (
        <div className="sf-component-log">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No log." />
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
        <Cascader size="small" options={options} />
      </div>
      <div className="body">
        <div className="config">
          <ComponentSpecPanel title="Component Spec" specs={data} />
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

  get cellModel() {
    return this.model as SFComponentCellModel;
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
