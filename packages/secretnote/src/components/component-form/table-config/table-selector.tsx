/* eslint-disable @typescript-eslint/no-explicit-any */
import { Cascader } from 'antd';
import { Popover } from 'antd';
import { Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

import { request } from '@/utils';

import type { SchemaValue } from './schema-selector';
import { SchemaSelector } from './schema-selector';

type Table = {
  uri: string;
  party: string;
};

type TableValue = {
  data_ref: Table[];
  schema: SchemaValue;
};

type TableOption = {
  label: string;
  value: string;
  children: TableOption[];
};

interface TableSelectorProps {
  value?: TableValue;
  onChange?: (value: Partial<TableValue>) => void;
}

const TableSelector = (props: TableSelectorProps) => {
  const [table, setTable] = useState<TableOption[]>();

  const requestData = async () => {
    const data: TableOption[] = [];
    const url = 'api/nodes';
    const init = { method: 'GET' };
    const nodes = await request(url, init);
    for (const node of nodes) {
      const { address } = node;
      const res = await request(`http://${address}/api/contents`, { method: 'GET' });
      data.push({
        label: node.name,
        value: node.name,
        children: res.content
          .filter((item: any) => item.name.endsWith('.csv'))
          .map((item: any) => ({ label: item.name, value: item.name })),
      });
    }
    setTable(data);
  };

  useEffect(() => {
    requestData();
  }, []);

  const getDefaultTable = (index: number) => {
    const dataRef = (props.value?.data_ref || [])[index];
    if (dataRef) {
      return [dataRef.party, dataRef.uri];
    }
    return [];
  };

  const getDefaultSchema = () => {
    const schema = props.value?.schema || {};
    return schema;
  };

  const onTableChange = (index: number, value: string[]) => {
    if (props.onChange) {
      if (value && value.length === 2) {
        const [party, uri] = value;
        const dataRef = props.value?.data_ref || [];
        dataRef[index] = { uri, party };
        props.onChange({
          data_ref: dataRef,
          schema: props.value?.schema,
        });
      } else {
        const dataRef = props.value?.data_ref || [];
        dataRef.splice(index, 1);
        props.onChange({
          data_ref: dataRef,
          schema: props.value?.schema,
        });
      }
    }
  };

  const onTableSchemaChange = (value: SchemaValue) => {
    if (props.onChange) {
      props.onChange({
        data_ref: props.value?.data_ref,
        schema: { ...props.value?.schema, ...value },
      });
    }
  };

  return (
    <span>
      {table?.map((item, index) => {
        return (
          <span className="table-selector" key={item.value}>
            {item.children.length > 0 ? (
              <>
                <Cascader
                  defaultValue={getDefaultTable(index)}
                  options={table}
                  onChange={(val) => onTableChange(index, val as string[])}
                />
                {index === 0 && (
                  <Popover
                    content={
                      <SchemaSelector
                        value={getDefaultSchema()}
                        onChange={onTableSchemaChange}
                      />
                    }
                    placement="right"
                    title=""
                    overlayClassName="secretnote-table-selector-popover"
                    trigger="click"
                    arrow={false}
                  >
                    <Settings size={14} cursor="pointer" />
                  </Popover>
                )}
              </>
            ) : (
              <span key={item.value} className="no-table">
                No table to choose.
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
};

export { TableSelector };
