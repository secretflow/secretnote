/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentSpec } from './type';
import type { SchemaItem, Attr } from './type';

// slightly larger than Number.EPSILON to avoid floating point precision issue
const NumberEpsilon = 2 * Number.EPSILON;

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
      return 'integer';
    case 'AT_STRING':
      return 'string';
    case 'AT_FLOAT':
      return 'number';
  }
  return 'string';
};

const getValue = (attr: Attr, key: 'defaultValue' | 'lowerBound' | 'upperBound') => {
  if (JSON.stringify(attr.atomic?.[key]) === '{}') {
    return 0; // e.g. lowerBound: {} means lowerBound is 0
  }
  switch (attr.type) {
    case 'AT_BOOL':
      return attr.atomic?.[key]?.b as boolean;
    case 'AT_INT':
      return attr.atomic?.[key]?.i64 as number;
    case 'AT_STRING':
      return attr.atomic?.[key]?.s as string;
    case 'AT_FLOAT':
      return attr.atomic?.[key]?.f as number;
  }
};

const isFieldRequired = (attr: Attr) => {
  return !attr.atomic.isOptional;
};

const isMinimumInclusive = (attr: Attr) => attr.atomic.lowerBoundInclusive;

const getMinimum = (attr: Attr) => {
  const lowerBound = Number(getValue(attr, 'lowerBound'));
  if (attr.atomic.lowerBoundEnabled) {
    return lowerBound + (isMinimumInclusive(attr) ? 0 : NumberEpsilon);
  }
  return undefined;
};

const getMaximum = (attr: Attr) => {
  if (attr.atomic.upperBoundEnabled) {
    return Number(getValue(attr, 'upperBound'));
  }
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
      outputs: {
        id: 'outputs',
        type: 'object',
        title: 'outputs',
        description: '',
        properties: {},
      },
    },
  };

  (spec.attrs || []).forEach((attr) => {
    const { name, desc } = attr;
    const type = getRenderType(attr);
    const options = getOptions(attr);
    const minimum = getMinimum(attr);
    const $minimumMessage =
      minimum === undefined
        ? undefined
        : 'Must be greater than ' +
          (isMinimumInclusive(attr)
            ? `or equal to ${minimum}`
            : `${minimum - NumberEpsilon}`);
    const attrItem: any = {
      id: name,
      type,
      title: name,
      description: desc,
      $componentType: options.length > 0 ? 'select' : 'input',
      $options: options.map((v) => ({
        label: v,
        value: v,
      })),
      $defaultValue: getValue(attr, 'defaultValue'),
      $required: isFieldRequired(attr),
      minimum,
      $minimumMessage,
      maximum: getMaximum(attr),
    };
    setByPath(json, `properties/attrs/properties/${name}`, attrItem);
  });

  (spec.inputs || []).forEach((input) => {
    const inputName = input.name;
    const inputItem = {
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
    setByPath(json, `properties/inputs/properties/${inputName}`, inputItem);
  });

  (spec.outputs || []).forEach((output) => {
    const outputName = output.name;
    const outputItem: any = {
      id: ['output', outputName],
      type: 'string',
      description: output.desc,
      title: outputName,
      $required: true,
    };
    setByPath(json, `properties/outputs/properties/${outputName}`, outputItem);
  });

  return json;
};

export { transformSpecToJsonSchema };
