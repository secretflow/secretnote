const clusterConfig = {
  public_config: {
    ray_fed_config: {
      parties: ['alice', 'bob'],
      addresses: ['alice:8000', 'bob:8000'],
    },
    spu_configs: [
      {
        name: 'spu',
        parties: ['alice', 'bob'],
        addresses: ['alice:8001', 'bob:8001'],
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
        config:
          '{"runtime_config":{"protocol":"REF2K","field":"FM64"},"link_desc":{"connect_retry_times":60,"connect_retry_interval_ms":1000,"brpc_channel_protocol":"http","brpc_channel_connection_type":"pooled","recv_timeout_ms":1200000,"http_timeout_ms":1200000}}',
      },
    ],
  },
};

const componentConfig = {
  domain: 'preprocessing',
  name: 'psi',
  version: '0.0.1',
  attr_paths: [
    'input/receiver_input/key',
    'input/sender_input/key',
    'protocol',
    'precheck_input',
    'bucket_size',
    'curve_type',
  ],
  attrs: [
    { ss: ['uid'] },
    { ss: ['uid'] },
    { s: 'ECDH_PSI_2PC' },
    { b: true },
    { i64: '1048576' },
    { s: 'CURVE_FOURQ' },
  ],
  inputs: [
    {
      name: 'receiver_input',
      type: 'sf.table.individual',
      data_refs: [{ uri: 'iris_alice.csv', party: 'alice', format: 'csv' }],
      meta: {
        '@type': 'type.googleapis.com/secretflow.spec.v1.IndividualTable',
        schema: {
          ids: ['uid'],
          id_types: ['str'],
        },
        line_count: -1,
      },
    },
    {
      name: 'sender_input',
      type: 'sf.table.individual',
      data_refs: [{ uri: 'iris_bob.csv', party: 'bob', format: 'csv' }],
      meta: {
        '@type': 'type.googleapis.com/secretflow.spec.v1.IndividualTable',
        schema: {
          ids: ['uid'],
          id_types: ['str'],
        },
        line_count: -1,
      },
    },
  ],
  output_uris: ['output.csv'],
};

const codeTemplate = `
from secretflow.spec.v1.evaluation_pb2 import NodeEvalParam
from secretflow.spec.extend.cluster_pb2 import SFClusterConfig
from secretflow.component.entry import comp_eval
from google.protobuf.json_format import Parse
from secretflow.spec.v1.data_pb2 import StorageConfig
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
    local_fs=StorageConfig.LocalFSConfig(wd="/home/vscode/examples"),
)

res = comp_eval(node_eval_config, storage_config, cluster_config)

print(f"The execution is complete and the result is: \\n{res}")
`;

export { codeTemplate };
