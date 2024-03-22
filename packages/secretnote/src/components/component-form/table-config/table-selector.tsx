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
  schema?: SchemaValue;
  schemas?: SchemaValue[];
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
      const res = await request('api/contents', { method: 'GET' }, node.id);
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

  const getDefaultSchema = (index: number) => {
    const dataRef = props.value?.data_ref || [];
    if (dataRef.length > 1) {
      return props.value?.schemas?.[index];
    } else if (dataRef.length === 1) {
      return props.value?.schema;
    }
  };

  const onTableChange = (index: number, value: string[]) => {
    if (props.onChange) {
      if (value && value.length === 2) {
        const [party, uri] = value;
        const dataRef = props.value?.data_ref || [];
        dataRef[index] = { uri, party };
        props.onChange({
          ...props.value,
          data_ref: dataRef,
        });
      } else {
        const dataRef = props.value?.data_ref || [];
        dataRef.splice(index, 1);
        props.onChange({
          ...props.value,
          data_ref: dataRef,
        });
      }
    }
  };

  const onTableSchemaChange = (index: number, value: SchemaValue) => {
    if (props.onChange) {
      const dataRef = props.value?.data_ref || [];
      if (dataRef.length > 1) {
        const schemas = props.value?.schemas || [];
        schemas[index] = { ...schemas[index], ...value };
        props.onChange({
          ...props.value,
          schemas: schemas,
          schema: undefined,
        });
      } else if (dataRef.length === 1) {
        props.onChange({
          ...props.value,
          schema: { ...props.value?.schema, ...value },
          schemas: undefined,
        });
      }
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
                <Popover
                  content={
                    <SchemaSelector
                      value={getDefaultSchema(index)}
                      onChange={(val) => onTableSchemaChange(index, val)}
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
