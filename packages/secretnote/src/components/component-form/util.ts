/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentSpec } from './type';
import type { SchemaItem, Attr } from './type';

const getOptions = (attr: Attr) => {
  if (attr.atomic.allowedValues) {
    return attr.atomic.allowedValues.ss;
  }
  return [];
};

const getRenderType = (attr: Attr): string => {
  switch (attr.type) {
    case 'AT_BOOL':
      return 'boolean';
    case 'AT_INT':
      return 'number';
    case 'AT_STRING':
      return 'string';
  }
};

const getDefaultValue = (attr: Attr) => {
  switch (attr.type) {
    case 'AT_BOOL':
      return attr.atomic?.defaultValue?.b;
    case 'AT_INT':
      return attr.atomic?.defaultValue?.i64;
    case 'AT_STRING':
      return attr.atomic?.defaultValue?.s;
  }
};

const isFieldRequired = (attr: Attr) => {
  return !attr.atomic.isOptional;
};

export const setByPath = (
  obj: any,
  path: string | string[],
  value: any,
  delimiter: string | RegExp = '/',
) => {
  const keys = Array.isArray(path) ? path : path.split(delimiter);
  const lastKey = keys.pop();
  if (lastKey) {
    let diver = obj;
    keys.forEach((key) => {
      if (diver[key] === null || diver[key] === undefined) {
        diver[key] = {};
      }
      diver = diver[key];
    });
    diver[lastKey] = value;
  }
  return obj;
};

export const getByPath = (
  obj: any,
  path: string | string[],
  delimiter: string | RegExp = '/',
) => {
  let ret;
  const keys = Array.isArray(path) ? path : path.split(delimiter);
  if (keys.length) {
    ret = obj;
    while (keys.length) {
      const key = keys.shift();
      if (Object(ret) === ret && key && key in ret) {
        ret = ret[key];
      } else {
        return undefined;
      }
    }
  }

  return ret;
};

const transformSpecToJsonSchema: (spec: ComponentSpec) => SchemaItem = (
  spec: ComponentSpec,
) => {
  const json: SchemaItem = {
    id: '$root',
    type: 'object',
    title: 'schema form',
    description: '',
    properties: {
      attrs: {
        id: 'attrs',
        type: 'object',
        title: 'attrs',
        description: '',
        properties: {},
      },
      inputs: {
        id: 'inputs',
        type: 'object',
        title: 'inputs',
        description: '',
        properties: {},
      },
    },
  };

  (spec.attrs || []).forEach((attr) => {
    const { name, desc } = attr;
    const type = getRenderType(attr);
    const options = getOptions(attr);

    const item: any = {
      id: name,
      type,
      title: name,
      description: desc,
      $componentType: options.length > 0 ? 'select' : 'input',
      $options: options.map((v) => ({
        label: v,
        value: v,
      })),
      $defaultValue: getDefaultValue(attr),
      $required: isFieldRequired(attr),
    };

    setByPath(json, `properties/attrs/properties/${name}`, item);
  });

  (spec.inputs || []).forEach((input) => {
    const inputName = input.name;

    const item = {
      id: inputName,
      type: 'object',
      title: inputName,
      description: input.desc,
      $componentType: 'tableConfig',
      $inputTableConfig: {
        types: input.types,
        attrs: (input.attrs || []).map((attr) => attr.name),
      },
    };
    setByPath(json, `properties/inputs/properties/${inputName}`, item);

    // const attrs = input.attrs || [];
    // attrs.forEach((attr) => {
    //   const attrName = attr.name;
    //   const title = `${inputName}.${attrName}`;
    //   const attrItem: any = {
    //     id: `input/${inputName}/${attrName}`,
    //     type: 'string',
    //     description: attr.desc,
    //     title,
    //     $required: true,
    //   };

    //   setByPath(json, `properties/inputs/properties/${title}`, attrItem);
    // });
  });

  return json;
};

export { transformSpecToJsonSchema };
