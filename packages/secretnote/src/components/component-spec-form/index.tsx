import { useMemoizedFn } from 'ahooks';
import {
  LevaPanel,
  LevaStoreProvider,
  useCreateStore,
  useStoreContext,
  useControls,
} from 'leva';
import type { DataInput } from 'leva/src/types';
import { useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import type { ComponentSpec, Value, SchemaItem } from './type';
import { toLevaSchema } from './util';
import './index.less';

interface SchemaProps {
  schema: ComponentSpec;
  defaultValue?: Value;
  onChange?: (changedValue: Value, fullValue: Value) => void;
}

const SchemaForm = (props: SchemaProps) => {
  const { schema, defaultValue, onChange } = props;
  const store = useStoreContext();

  const getValue = useMemoizedFn(() => {
    const data = store.getData();
    return Object.fromEntries(
      Object.values(data).map((item) => [item.key, (item as DataInput).value]),
    );
  });

  const levaSchema = useMemo(() => {
    return toLevaSchema(schema, (item, key) => {
      const config = {
        onChange: (value, path, context) => {
          if (context.initial || !context.fromPanel) {
            return;
          }

          const full = getValue();
          onChange?.({ [context.key]: value }, full);
        },
      } as SchemaItem;

      if (defaultValue && defaultValue[key]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (config as any)['value'] = defaultValue[key];
      }

      return config;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema]);

  useControls(levaSchema, { store }, [schema]);

  return null;
};

interface ComponentSpecFormProps {
  specs: ComponentSpec;
  defaultValue?: Value;
  onChange?: (changedValue: Value, fullValue: Value) => void;
  title?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const ComponentSpecForm = (props: ComponentSpecFormProps) => {
  const { defaultValue, title, onChange, specs, className, style } = props;
  const store = useCreateStore();

  return (
    <div className={`component-spec-form ${className}`} style={style}>
      <LevaPanel
        hideCopyButton
        neverHide
        titleBar={{ title, drag: false }}
        fill
        flat
        store={store}
        theme={{
          colors: {
            elevation1: '#f7f9fa',
            elevation2: '#f7f9fa',
            elevation3: '#0000000f',
            highlight1: '#00000073',
            highlight3: '#40566c',
          },
        }}
      />
      <LevaStoreProvider store={store}>
        <SchemaForm schema={specs} defaultValue={defaultValue} onChange={onChange} />
      </LevaStoreProvider>
    </div>
  );
};

export { ComponentSpecForm };
export * from './type';
