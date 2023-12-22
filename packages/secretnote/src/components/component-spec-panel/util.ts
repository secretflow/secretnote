import { LevaInputs } from 'leva';
import { SpecialInputs, type Schema } from 'leva/src/types';

import type { ComponentSpec, SchemaItem, Attr, Value } from './type';

export const getOptions = (attr: Attr) => {
  if (attr.atomic.allowedValues) {
    return attr.atomic.allowedValues.ss;
  }
  return undefined;
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
      return attr.atomic.defaultValue.b;
    case 'AT_INT':
      return attr.atomic.defaultValue.i64;
    case 'AT_STRING':
      return attr.atomic.defaultValue.s;
  }
};

export const getDefaultValues = (specs: ComponentSpec) => {
  const res: Value = {};
  specs.attrs.forEach((attr) => {
    res[attr.name] = getDefaultValue(attr);
  });
  return res;
};

export const toLevaSchema = (
  specs: ComponentSpec,
  visitItem?: (item: ComponentSpec, key: string) => Partial<SchemaItem>,
): Schema => {
  const res: Record<string, Schema> = {
    attrs: {},
    inputs: {},
    outputs: {},
  };

  specs.attrs.forEach((attr) => {
    const key = attr.name;
    const after = visitItem?.(specs, key) || {};
    const schema: SchemaItem = {
      type: getRenderType(attr),
      label: attr.name,
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
      const attrSchema: SchemaItem = {
        type: LevaInputs.STRING,
        label: `${key}.${attr.name}`,
        value: '',
      };
      res.inputs[`input/${key}/${attr.name}`] = attrSchema;
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
