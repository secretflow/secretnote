import { Input, Form } from 'antd';

export type SchemaValue = {
  ids?: string[];
  id_types?: string[];
  features?: string[];
  feature_types?: string[];
  labels?: string[];
  label_types?: string[];
};

interface SchemaSelectorProps {
  value?: SchemaValue;
  onChange?: (value: SchemaValue) => void;
}

const labelCol = { span: 8 };
const wrapperCol = { offset: 4, span: 12 };

const schemaTypes = [
  {
    key: 'features',
  },
  {
    key: 'feature_types',
  },
  {
    key: 'labels',
  },
  {
    key: 'label_types',
  },
  {
    key: 'ids',
  },
  {
    key: 'id_types',
  },
];

const SchemaSelector = (props: SchemaSelectorProps) => {
  const { value, onChange } = props;

  const getDefaultValue = (key: string) => {
    const k = key as keyof SchemaValue;
    return value?.[k]?.join(',');
  };

  return (
    <span className="schema-selector">
      {schemaTypes.map((item) => (
        <Form.Item
          key={item.key}
          labelCol={labelCol}
          wrapperCol={wrapperCol}
          label={item.key}
        >
          <Input
            defaultValue={getDefaultValue(item.key)}
            onChange={(e) => {
              if (onChange) {
                onChange({ [item.key]: e.target.value.split(',') });
              }
            }}
          />
        </Form.Item>
      ))}
    </span>
  );
};

export { SchemaSelector };
