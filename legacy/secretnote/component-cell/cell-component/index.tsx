import type { IOutput } from '@difizen/libro-jupyter';
import type { DescriptionsProps, TableProps, TabsProps } from 'antd';
import { Descriptions, Empty, Spin, Table, Tabs } from 'antd';
import { forwardRef, useMemo, type ForwardedRef } from 'react';

import type { ComponentSpec, Value } from '@/components/component-form';
import { ComponentForm } from '@/components/component-form';

import { ComponentReport } from '../model';
import { generateComponentCellCode } from './cell-code';
import './index.less';
import { ComponentOptions, getComponentByIds, getComponentIds } from './options';

interface CellComponentProps {
  component?: ComponentSpec;
  onComponentChange?: (component: ComponentSpec) => void;
  defaultComponentConfig?: Value;
  onComponentConfigChange?: (changedValues: Value, values: Value) => void;
  outputs: IOutput[];
  report: ComponentReport | null; // data for the Report tab
  loading?: boolean;
}

const CellComponent = forwardRef(
  (props: CellComponentProps, ref: ForwardedRef<any>) => {
    const {
      component,
      onComponentChange,
      defaultComponentConfig,
      onComponentConfigChange,
      outputs,
      report,
      loading,
    } = props;

    // content of Log tab
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

    // content of Report tab
    const reportDescriptionItems: DescriptionsProps['items'] = report
      ? [
          { key: '1', label: 'report.name', children: report.name },
          { key: '2', label: 'report.meta.name', children: report.metaName },
          { key: '3', label: 'report.meta.desc', children: report.metaDesc },
        ]
      : [];
    const reportTableColumns: TableProps['columns'] = report
      ? [
          // 2D array, first column holds row names
          { title: '', dataIndex: '$key', key: -1, rowScope: 'row' },
          ...report.metaColumnNames.map((name, idx) => ({
            title: name,
            dataIndex: name,
            key: name,
          })),
        ]
      : [];
    const reportTableDataSource = report
      ? (() => {
          const dataSource = [];
          for (let i = 0; i < report.metaRowItems.length!; i++) {
            const obj: Value = {
              $key: report.metaRowNames[i],
            };
            report.metaColumnNames.forEach((name, j) => {
              obj[name] = Object.values(report.metaRowItems[i][j])[0];
            });
            dataSource.push({ ...obj });
          }
          return dataSource;
        })()
      : [];

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
            {report ? (
              <div>
                <Descriptions items={reportDescriptionItems} />
                <Table
                  columns={reportTableColumns}
                  dataSource={reportTableDataSource}
                  pagination={false}
                  virtual={true}
                />
              </div>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No report." />
            )}
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

export { CellComponent, generateComponentCellCode, getComponentByIds, getComponentIds };
