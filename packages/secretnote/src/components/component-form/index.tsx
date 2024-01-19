import SchemaForm from 'antd-schema-form';
import './index.less';
import type { ForwardedRef } from 'react';
import { forwardRef } from 'react';

import { TableConfig } from './table-config';
import type { ComponentSpec, Value } from './type';
import { transformSpecToJsonSchema } from './util';

interface ComponentFormProps {
  config: ComponentSpec;
  value?: Value;
  onValuesChange?: (changedValues: Value, values: Value) => void;
}

const ComponentForm = forwardRef(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (props: ComponentFormProps, ref: ForwardedRef<any>) => {
    return (
      <div className="component-form">
        <SchemaForm
          ref={ref}
          json={transformSpecToJsonSchema(props.config)}
          value={props.value}
          customComponent={TableConfig}
          formOptions={{
            size: 'small',
            layout: 'horizontal',
            labelAlign: 'left',
            labelCol: { span: 8 },
            wrapperCol: { span: 12, offset: 4 },
            initialValues: props.value,
            onValuesChange(changedValues, values) {
              // eslint-disable-next-line no-console
              console.log(values);
              props.onValuesChange?.(changedValues, values);
            },
          }}
        />
      </div>
    );
  },
);
ComponentForm.displayName = 'ComponentForm';

export { ComponentForm };
