const code = `
import json
import os

from secretflow.component.entry import comp_eval
from secretflow.spec.extend.cluster_pb2 import (
    SFClusterConfig,
    SFClusterDesc,
)
from secretflow.spec.v1.component_pb2 import Attribute
from secretflow.spec.v1.data_pb2 import (
    DistData,
    TableSchema,
    IndividualTable,
    StorageConfig,
)
from secretflow.spec.v1.evaluation_pb2 import NodeEvalParam


party = os.getenv("SELF_PARTY", "alice")

desc = SFClusterDesc(
    parties=["alice", "bob"],
    devices=[
        SFClusterDesc.DeviceDesc(
            name="spu",
            type="spu",
            parties=["alice", "bob"],
            config=json.dumps(
                {
                    "runtime_config": {"protocol": "REF2K", "field": "FM64"},
                    "link_desc": {
                        "connect_retry_times": 60,
                        "connect_retry_interval_ms": 1000,
                        "brpc_channel_protocol": "http",
                        "brpc_channel_connection_type": "pooled",
                        "recv_timeout_ms": 1200 * 1000,
                        "http_timeout_ms": 1200 * 1000,
                    },
                }
            ),
        ),
        SFClusterDesc.DeviceDesc(
            name="heu",
            type="heu",
            parties=[],
            config=json.dumps(
                {
                    "mode": "PHEU",
                    "schema": "paillier",
                    "key_size": 2048,
                }
            ),
        ),
    ],
)

sf_cluster_config = SFClusterConfig(
    desc=desc,
    public_config=SFClusterConfig.PublicConfig(
        ray_fed_config=SFClusterConfig.RayFedConfig(
            parties=["alice", "bob"],
            addresses=[
                "alice:8000",
                "bob:8000",
            ],
        ),
        spu_configs=[
            SFClusterConfig.SPUConfig(
                name="spu",
                parties=["alice", "bob"],
                addresses=[
                    "alice:8001",
                    "bob:8001",
                ],
            )
        ],
    ),
    private_config=SFClusterConfig.PrivateConfig(
        self_party=party,
        ray_head_addr="127.0.0.1:6379",
    ),
)

storage_config = StorageConfig(
    type="local_fs",
    local_fs=StorageConfig.LocalFSConfig(wd="/home/vscode/examples"),
)

sf_node_eval_param = NodeEvalParam(
    domain="preprocessing",
    name="psi",
    version="0.0.1",
    attr_paths=[
        "protocol",
        "sort",
        "bucket_size",
        "ecdh_curve_type",
        "input/receiver_input/key",
        "input/sender_input/key",
    ],
    attrs=[
        Attribute(s="ECDH_PSI_2PC"),
        Attribute(b=True),
        Attribute(i64=1048576),
        Attribute(s="CURVE_FOURQ"),
        Attribute(ss=["{input/receiver_input/key}"]),
        Attribute(ss=["{input/sender_input/key}"]),
    ],
    inputs=[
        DistData(
            name="receiver_input",
            type="sf.table.individual",
            data_refs=[
                DistData.DataRef(uri="{receiver_input}", party="alice", format="csv"),
            ],
        ),
        DistData(
            name="sender_input",
            type="sf.table.individual",
            data_refs=[
                DistData.DataRef(uri="{sender_input}", party="bob", format="csv"),
            ],
        ),
    ],
    output_uris=[
        "{psi_output}",
    ],
)

sf_node_eval_param.inputs[0].meta.Pack(
    IndividualTable(
        schema=TableSchema(
            id_types=["str"],
            ids=["{input/receiver_input/key}"],
        ),
        line_count=-1,
    ),
)

sf_node_eval_param.inputs[1].meta.Pack(
    IndividualTable(
        schema=TableSchema(
            id_types=["str"],
            ids=["{input/sender_input/key}"],
        ),
        line_count=-1,
    ),
)

res = comp_eval(sf_node_eval_param, storage_config, sf_cluster_config)

print(res)
`;

export const getCode = (values: Record<string, any>) => {
  return code
    .replace(/\{receiver_input\}/g, values.receiver_input)
    .replace(/\{input\/receiver_input\/key\}/g, values['input/receiver_input/key'])
    .replace(/\{sender_input\}/g, values.sender_input)
    .replace(/\{input\/sender_input\/key\}/g, values['input/sender_input/key'])
    .replace(/\{psi_output\}/g, values.psi_output);
};
