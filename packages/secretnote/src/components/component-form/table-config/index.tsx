import type { FormInstance } from 'antd';
import { Input, Form, Select } from 'antd';

import type { SchemaItem } from '../type';
import { getByPath } from '../util';

import { TableSelector } from './table-selector';

const labelCol = { span: 8 };
const wrapperCol = { offset: 4, span: 12 };

const TableConfig = {
  tableConfig: (props: { root: SchemaItem; form: FormInstance }) => {
    const { root } = props;
    const types = getByPath(root, '$inputTableConfig/types');
    const attrs = getByPath(root, '$inputTableConfig/attrs');

    const getInputType = () => {
      const type = props.form.getFieldValue(['input', root.id, 'type']);
      if (type) {
        return type.split('.')[1];
      }
    };

    return (
      <Form.Item
        label={root.id}
        labelCol={{ span: 24 }}
        wrapperCol={{ offset: 1 }}
        key={root.id}
        className="table-config-item"
      >
        <Form.Item
          label="type"
          name={['input', root.id, 'type']}
          labelCol={labelCol}
          wrapperCol={wrapperCol}
        >
          <Select
            options={types.map((type: string) => ({ label: type, value: type }))}
          />
        </Form.Item>
        {attrs.map((item: string) => (
          <Form.Item
            key={item}
            label={item}
            name={`input/${root.id}/${item}`}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
          >
            <Input />
          </Form.Item>
        ))}
        {getInputType() === 'table' && (
          <Form.Item
            label="tables"
            name={['input', root.id, 'tables']}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
            dependencies={['input', root.id, 'type']}
          >
            <TableSelector />
          </Form.Item>
        )}
      </Form.Item>
    );
  },
};

export { TableConfig };
