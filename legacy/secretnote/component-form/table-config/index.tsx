import type { FormInstance } from 'antd';
import { Input, Form, Select } from 'antd';

import type { IOTypeKind, SchemaItem } from '../type';
import { getByPath } from '../util';

import { TableSelector } from './table-selector';

const labelCol = { span: 8 };
const wrapperCol = { offset: 4, span: 12 };

const TableConfig = {
  tableConfig: (props: { root: SchemaItem; form: FormInstance }) => {
    const { root } = props;
    const types = getByPath(root, '$inputTableConfig/types');
    const attrs = getByPath(root, '$inputTableConfig/attrs');

    const getInputKind = () => {
      const type = props.form.getFieldValue(['input', root.id, 'type']);
      if (type) {
        return type.split('.')[1] as IOTypeKind;
      }
    };
    const inputKind = getInputKind();

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
        {/* Prepare table data_ref selector for table input */}
        {inputKind === 'table' && (
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
        {/* Prepare model context varibale input for model input */}
        {/* TODO this is not a table exactly. Extract from table-config? */}
        {inputKind === 'model' && (
          <Form.Item
            label="model"
            name={['input', root.id, 'model']}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
            dependencies={['input', root.id, 'type']}
          >
            <Input />
          </Form.Item>
        )}
        {/* Prepare rule context varibale input for rule input */}
        {/* TODO this is not a table exactly. Extract from table-config? */}
        {inputKind === 'rule' && (
          <Form.Item
            label="rule"
            name={['input', root.id, 'rule']}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
            dependencies={['input', root.id, 'type']}
          >
            <Input />
          </Form.Item>
        )}
      </Form.Item>
    );
  },
};

export { TableConfig };
