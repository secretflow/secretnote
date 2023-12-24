/* eslint-disable @typescript-eslint/no-explicit-any */
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

export interface SchemaProps {
  specs: ComponentSpec;
  defaultValue?: Value;
  onChange?: (changedValue: Value, fullValue: Value) => void;
}

const Schema = (props: SchemaProps) => {
  const { specs, defaultValue, onChange } = props;
  const store = useStoreContext();

  const getValue = useMemoizedFn(() => {
    const data = store.getData();
    return Object.fromEntries(
      Object.values(data).map((item) => [item.key, (item as DataInput).value]),
    );
  });

  const levaSchema = useMemo(() => {
    return toLevaSchema(specs, (item, key) => {
      const config = {
        onChange: (value, path, context) => {
          if (context.initial || !context.fromPanel) {
            return;
          }

          const full = getValue();
          onChange?.({ [context.key]: value } as any, full as any);
        },
      } as SchemaItem;

      if (defaultValue && defaultValue[key]) {
        (config as any)['value'] = defaultValue[key];
      }

      return config;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specs]);

  useControls(levaSchema, { store }, [specs]);

  return null;
};

interface ComponentSpecPanelProps {
  specs: ComponentSpec;
  defaultValue?: Value;
  onChange?: (changedValue: Value, fullValue: Value) => void;
  title?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const ComponentSpecPanel = (props: ComponentSpecPanelProps) => {
  const { defaultValue, title, onChange, specs, className, style } = props;
  const store = useCreateStore();

  return (
    <div className={`component-spec-panel ${className}`} style={style}>
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
        <Schema specs={specs} defaultValue={defaultValue} onChange={onChange} />
      </LevaStoreProvider>
    </div>
  );
};

export { ComponentSpecPanel };
export * from './type';
