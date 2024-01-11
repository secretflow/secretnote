import { Tooltip } from 'antd';
import { LevaInputs } from 'leva';
import { SpecialInputs, type Schema } from 'leva/src/types';

import type { ComponentSpec, SchemaItem, Attr } from './type';

export const getOptions = (attr: Attr) => {
  if (attr.atomic.allowedValues) {
    return attr.atomic.allowedValues.ss;
  }
  return [];
};

export const getRenderType = (attr: Attr): LevaInputs => {
  switch (attr.type) {
    case 'AT_BOOL':
      return LevaInputs.BOOLEAN;
    case 'AT_INT':
      return LevaInputs.NUMBER;
    case 'AT_STRING':
      if (getOptions(attr)) {
        return LevaInputs.SELECT;
      }
      return LevaInputs.STRING;
  }
};

export const getDefaultValue = (attr: Attr) => {
  switch (attr.type) {
    case 'AT_BOOL':
      return attr.atomic?.defaultValue?.b;
    case 'AT_INT':
      return attr.atomic?.defaultValue?.i64;
    case 'AT_STRING':
      return attr.atomic?.defaultValue?.s;
  }
};

export const getLabel = (attr: Attr) => {
  const label = attr.name;
  const required = !attr.atomic.isOptional;
  const description = attr.desc;

  return (
    <Tooltip title={description} placement="left">
      <span>
        {required && <span style={{ color: 'red' }}>*</span>}
        &nbsp;
        {label}
      </span>
    </Tooltip>
  );
};

export const toLevaSchema = (
  specs: ComponentSpec,
  visitItem?: (item: ComponentSpec, key: string) => Partial<SchemaItem>,
): Schema => {
  const res: Record<'attrs' | 'inputs' | 'outputs', Schema> = {
    attrs: {},
    inputs: {},
    outputs: {},
  };

  (specs.attrs || []).forEach((attr) => {
    const key = attr.name;
    const after = visitItem?.(specs, key) || {};
    const schema: SchemaItem = {
      type: getRenderType(attr),
      label: getLabel(attr),
      value: getDefaultValue(attr),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options: getOptions(attr) as any,
      ...(after as object),
    };
    res.attrs[key] = schema;
  });

  specs.inputs.forEach((input) => {
    const key = input.name;
    const after = visitItem?.(specs, key) || {};
    const schema: SchemaItem = {
      type: LevaInputs.STRING,
      label: key,
      value: '',
      ...(after as object),
    };
    res.inputs[key] = schema;

    const attrs = input.attrs || [];
    attrs.forEach((attr) => {
      const k = `input/${key}/${attr.name}`;
      const afterSchema = visitItem?.(specs, k) || {};
      const attrSchema: SchemaItem = {
        type: LevaInputs.STRING,
        label: `${key}.${attr.name}`,
        value: '',
        ...(afterSchema as object),
      };
      res.inputs[k] = attrSchema;
    });
  });

  specs.outputs.forEach((output) => {
    const key = output.name;
    const after = visitItem?.(specs, key) || {};
    const schema: SchemaItem = {
      type: LevaInputs.STRING,
      label: key,
      value: '',
      ...(after as object),
    };
    res.outputs[key] = schema;
  });

  const schemas: Schema = {
    attrs: {
      type: SpecialInputs.FOLDER,
      schema: res.attrs,
      settings: { collapsed: false },
    },
    inputs: {
      type: SpecialInputs.FOLDER,
      schema: res.inputs,
      settings: { collapsed: false },
    },
    outputs: {
      type: SpecialInputs.FOLDER,
      schema: res.outputs,
      settings: { collapsed: false },
    },
  };

  return schemas;
};
