/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentSpec, Value, IOType } from '@/components/component-form';

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

const getIOMetaType = (type: IOType) => {
  if (type === 'sf.table.individual') {
    return 'type.googleapis.com/secretflow.spec.v1.IndividualTable';
  } else if (type === 'sf.table.vertical_table') {
    return 'type.googleapis.com/secretflow.spec.v1.VerticalTable';
  }
  return '';
};

/**
 * Generate Python code for a component cell.
 */
const generateComponentCellCode = (component: ComponentSpec, config: Value) => {
  if (!(component && config)) {
    return '';
  }

  const componentConfig: any = {
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
      const { type, tables } = value;
      const schemaKey = type === 'sf.table.individual' ? 'schema' : 'schemas';
      if (type && tables) {
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
    });
  }

  // output
  if (output) {
    Object.entries(output).forEach(([, value]) => {
      componentConfig.output_uris.push(value);
    });
  }

  return `
if True: # limit the scope of the execution to avoid polluting the global namespace
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

  storage_config = StorageConfig(
      type="local_fs",
      local_fs=StorageConfig.LocalFSConfig(wd=os.getcwd()),
  )

  res = comp_eval(node_eval_config, storage_config, cluster_config)

  print(f"The execution is complete and the result is: \\n{res}")
  
  Comm().send(data={"$type": "secretnote.component-cell.result", "payload": MessageToJson(res, indent=0)})
    `.trim();
};

export { generateComponentCellCode };
