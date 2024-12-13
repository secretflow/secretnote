/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ComponentSpec,
  IOType,
  IOTypeKind,
  Value,
} from '@/components/component-form';

const deviceConfig = {
  runtime_config: { protocol: 'REF2K', field: 'FM64' },
  link_desc: {
    connect_retry_times: 60,
    connect_retry_interval_ms: 1000,
    brpc_channel_protocol: 'http',
    brpc_channel_connection_type: 'pooled',
    recv_timeout_ms: 1200000,
    http_timeout_ms: 1200000,
  },
};

const RayFedPort = 8000;
const SPUPort = 8001;
const clusterConfig = {
  public_config: {
    ray_fed_config: {
      parties: ['alice', 'bob'],
      addresses: [`alice:${RayFedPort}`, `bob:${RayFedPort}`],
    },
    spu_configs: [
      {
        name: 'spu',
        parties: ['alice', 'bob'],
        addresses: [`alice:${SPUPort}`, `bob:${SPUPort}`],
      },
    ],
  },
  private_config: { self_party: '{self_party}', ray_head_addr: '127.0.0.1:6379' },
  desc: {
    parties: ['alice', 'bob'],
    devices: [
      {
        name: 'spu',
        type: 'spu',
        parties: ['alice', 'bob'],
        config: JSON.stringify(deviceConfig),
      },
      {
        name: 'heu',
        type: 'heu',
        parties: [],
        config: JSON.stringify({
          mode: 'PHEU',
          schema: 'paillier',
          key_size: 2048,
        }),
      },
    ],
  },
};

const getAttrValue = (component: ComponentSpec, key: string, value: any) => {
  const commonAttr = (component.attrs || []).find((attr) => attr.name === key);
  if (commonAttr) {
    const type = commonAttr.type;
    switch (type) {
      case 'AT_INT':
        return { i64: value };
      case 'AT_BOOL':
        return { b: value };
      case 'AT_STRING':
        return { s: value };
      case 'AT_FLOAT':
        return { f: value };
      default:
        return { s: value };
    }
  } else {
    // input has no marked data type in the attr, so it can only be fixed
    return { ss: (value || '').split(',') };
  }
};

/**
 * Get the type spec of the input/output.
 */
const getIOMetaType = (type: IOType) => {
  const mapping: Record<IOType, string> = {
    'sf.table.individual': 'secretflow.spec.v1.IndividualTable',
    'sf.table.vertical_table': 'secretflow.spec.v1.VerticalTable',
    'sf.rule.binning': 'secretflow.spec.extend.DeviceObjectCollection',
    'sf.model.sgb': 'secretflow.spec.extend.DeviceObjectCollection',
    'sf.model.ss_glm': 'secretflow.spec.extend.DeviceObjectCollection',
    'sf.model.ss_sgd': 'secretflow.spec.extend.DeviceObjectCollection',
    'sf.model.ss_xgb': 'secretflow.spec.extend.DeviceObjectCollection',
    'sf.report': 'secretflow.spec.v1.Report',
  };

  return mapping[type] ? `type.googleapis.com/${mapping[type]}` : '';
};

// Operators that outputs are required to be exposed to a context variable
const ExposeOutputOps = [
  'feature.vert_binning',
  'feature.vert_woe_binning',
  'ml.train.ss_xgb_train',
  'ml.train.ss_glm_train',
  'ml.train.ss_sgd_train',
  'ml.train.sgb_train',
] as const;

/**
 * Generate Python code for a component cell.
 */
const generateComponentCellCode = (component: ComponentSpec, config: Value) => {
  if (!(component && config)) {
    return '';
  }

  const __extra = Symbol('__extra');
  const componentConfig: any = {
    [__extra]: {}, // extra information to carry and won't be stringified into JSON
    domain: component.domain,
    name: component.name,
    version: component.version,
    attr_paths: [],
    attrs: [],
    inputs: [],
    output_uris: [],
  };

  const { input, output, ...others } = config;

  // attr
  if (others) {
    Object.entries(others).forEach(([key, value]) => {
      componentConfig.attr_paths.push(key);
      const attrValue = getAttrValue(component, key, value);
      componentConfig.attrs.push(attrValue);
    });
  }

  // input
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (input) {
    Object.entries(input).forEach(([key, value]: [string, any]) => {
      const { type } = value as { type?: IOType } & Record<any, any>;

      if (type) {
        const typeKind = type.split('.')[1] as IOTypeKind;
        switch (typeKind) {
          case 'table': {
            const { tables } = value;
            const schemaKey = type === 'sf.table.individual' ? 'schema' : 'schemas';
            if (tables) {
              componentConfig.inputs.push({
                name: key,
                type: type,
                data_refs: tables.data_ref.map((ref: any) => ({
                  uri: ref.uri,
                  party: ref.party,
                  format: 'csv',
                })),
                meta: {
                  '@type': getIOMetaType(type),
                  [schemaKey]: tables[schemaKey],
                  line_count: -1,
                },
              });
            }
            break;
          }
          case 'model': {
            const { model } = value; // variable name in the context storing the model
            if (model) {
              // model is variable name and cannot be stringified into a pb-parseable JSON
              componentConfig[__extra].model = model;
            }
            break;
          }
          case 'rule': {
            // the same processing procedure as model
            const { rule } = value;
            if (rule) {
              componentConfig[__extra].rule = rule;
            }
            break;
          }
          case 'report':
            // currently no report will be used as input
            throw new Error('Report is not expected to be used as input.');
        }
      }
    });
  }

  // output
  if (output) {
    Object.entries(output).forEach(([, value]) => {
      componentConfig.output_uris.push(value);
    });
  }

  // some outputs (e.g. trained model, binning rule) will be exposed to a context variable
  // whose name is the same as output_uri so that can be referred to in the following cells
  const outputCtxVars: string[] | undefined = ExposeOutputOps.includes(
    `${componentConfig.domain}.${componentConfig.name}` as any,
  )
    ? [...componentConfig.output_uris]
    : undefined;
  const outputCtxVarsDecl = outputCtxVars ? `${outputCtxVars.join(' = ')} = None` : '';
  const outputCtxVarsAssign = outputCtxVars
    ? `global ${outputCtxVars.join(', ')}\n` +
      outputCtxVars.map((v, i) => `  ${v} = res.outputs[${i}]`).join('\n')
    : '';

  return `
${outputCtxVarsDecl}
def __run_component(): # limit the scope to avoid polluting global
  from secretflow.spec.v1.evaluation_pb2 import NodeEvalParam
  from secretflow.spec.v1.data_pb2 import StorageConfig
  from secretflow.spec.extend.cluster_pb2 import SFClusterConfig
  from secretflow.component.entry import comp_eval
  from google.protobuf.json_format import Parse, MessageToJson
  from ipykernel.comm import Comm
  import os

  cluster_config_str = r"""
  ${JSON.stringify(clusterConfig)}
  """

  component_config_str = r"""
  ${JSON.stringify(componentConfig)}
  """

  self_party = os.getenv("SELF_PARTY", "alice")
  cluster_config = SFClusterConfig()
  Parse(cluster_config_str.replace('{self_party}', self_party), cluster_config)

  node_eval_config = NodeEvalParam()
  Parse(component_config_str, node_eval_config)
  ${componentConfig[__extra].model ? `node_eval_config.inputs.insert(0, ${componentConfig[__extra].model})` : ''}
  ${componentConfig[__extra].rule ? `node_eval_config.inputs.append(${componentConfig[__extra].rule})` : ''}
  
  storage_config = StorageConfig(
      type="local_fs",
      local_fs=StorageConfig.LocalFSConfig(wd=os.getcwd()),
  )

  res = comp_eval(node_eval_config, storage_config, cluster_config)

  print(f"The execution is complete and the result is: \\n{res}")

  ${outputCtxVarsAssign}

  Comm().send(data={"$type": "component-cell.result", "payload": MessageToJson(res, indent=0)})

__run_component()
    `.trim();
};

export { generateComponentCellCode };
