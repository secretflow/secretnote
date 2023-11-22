import endent from 'endent';

import type { Snippet } from './protocol';

export const snippets: Snippet[] = [
  {
    key: 'init_secretflow',
    title: 'Init SecretFlow',
    type: '初始化',
    code: endent`
    import os
    import secretflow as sf
    import spu

    network_conf = {
        'parties': {
            'alice': {
                'address': '{alice_address}',
            },
            'bob': {
                'address': '{bob_address}',
            },
        },
    }

    sf.shutdown()
    self_party = os.getenv('SELF_PARTY', 'alice')
    sf.init(
        address='{ray_address}',
        cluster_config={**network_conf, 'self_party': self_party},
        log_to_driver=True,
    )
    `,
    jsonSchema: {
      type: 'object',
      required: ['alice_address', 'bob_address', 'ray_address'],
      properties: {
        alice_address: {
          type: 'string',
          title: 'Alice 地址',
          default: 'alice:8000',
        },
        bob_address: {
          type: 'string',
          title: 'Bob 地址',
          default: 'bob:8000',
        },
        ray_address: {
          type: 'string',
          title: 'Ray 地址',
          default: '127.0.0.1:6379',
        },
      },
    },
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: true,
      },
      alice_address: {
        'ui:autofocus': true,
        'ui:enableMarkdownInDescription': true,
        'ui:description':
          '填写可以被 `bob` 访通的地址，并且选择一个**未被占用**的端口 ，注意不要和 Ray 端口冲突。',
      },
      bob_address: {
        'ui:enableMarkdownInDescription': true,
        'ui:description':
          '填写可以被 `alice` 访通的地址，并且选择一个**未被占用**的端口 ，注意不要和 Ray 端口冲突。',
      },
      ray_address: {
        'ui:description': 'Ray 的启动地址。',
      },
    },
  },
  {
    key: 'init_spu',
    title: 'Init SPU',
    type: '初始化',
    code: endent`
    alice, bob = sf.PYU('alice'), sf.PYU('bob')
    spu_conf = {
        'nodes': [
            {
                'party': 'alice',
                'address': '{alice_address}',
                'listen_addr': '{alice_listen_address}'
            },
            {
                'party': 'bob',
                'address': '{bob_address}',
                'listen_addr': '{bob_listen_address}}'
            },
        ],
        'runtime_config': {
            'protocol': spu.spu_pb2.SEMI2K,
            'field': spu.spu_pb2.FM128,
            'sigmoid_mode': spu.spu_pb2.RuntimeConfig.SIGMOID_REAL,
        },
    }
    spu = sf.SPU(cluster_def=spu_conf)
    `,
    jsonSchema: {
      type: 'object',
      required: [
        'alice_address',
        'alice_listen_address',
        'bob_address',
        'bob_listen_address',
      ],
      properties: {
        alice_address: {
          type: 'string',
          title: 'Alice 地址',
          default: 'alice:8001',
        },
        alice_listen_address: {
          type: 'string',
          title: 'Alice 监听地址',
          default: 'alice:8001',
        },
        bob_address: {
          type: 'string',
          title: 'Bob 地址',
          default: 'bob:8001',
        },
        bob_listen_address: {
          type: 'string',
          title: 'Bob 监听地址',
          default: 'bob:8001',
        },
      },
    },
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: true,
      },
      alice_address: {
        'ui:autofocus': true,
        'ui:enableMarkdownInDescription': true,
        'ui:description':
          '填写可以被 `bob` 访通的地址，并且选择一个**未被占用**的端口 ，注意不要和 Ray 端口冲突。',
      },
      alice_listen_address: {
        'ui:autofocus': true,
        'ui:description': '可以和 Alice 地址一致。',
      },
      bob_address: {
        'ui:enableMarkdownInDescription': true,
        'ui:description':
          '填写可以被 `alice` 访通的地址，并且选择一个**未被占用**的端口 ，注意不要和 Ray 端口冲突。',
      },
      bob_listen_address: {
        'ui:description': '可以和 Bob 地址一致。',
      },
    },
  },
  {
    key: 'horizontal_split',
    title: '水平拆分',
    type: '数据处理',
    code: endent`
    import pandas as pd

    row = {row}

    alldata_df = pd.read_csv('{data_path}')
    h_alice_df = alldata_df.iloc[:row]
    h_bob_df = alldata_df.iloc[row:]

    h_alice_df.to_csv('{h_alice_path}', index=False)
    h_bob_df.to_csv('{h_bob_path}', index=False)
    `,
    jsonSchema: {
      type: 'object',
      required: ['data_path', 'row', 'h_alice_path', 'h_bob_path'],
      properties: {
        data_path: {
          type: 'string',
          title: '数据地址',
          default: '',
        },
        row: {
          type: 'number',
          title: '拆分行',
          default: 100,
        },
        h_alice_path: {
          type: 'string',
          title: '文件一地址',
          default: '',
        },
        h_bob_path: {
          type: 'string',
          title: '文件二地址',
          default: '',
        },
      },
    },
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: true,
      },
      data_path: {
        'ui:autofocus': true,
        'ui:description': '填写待拆分的数据地址。（可以是相对地址）',
      },
      row: {
        'ui:description': '按照第几行进行拆分，也就是第一份结果保留多少条数据。',
      },
      h_alice_path: {
        'ui:description': '文件一地址。（可以是相对地址）',
      },
      h_bob_path: {
        'ui:description': '文件二地址。（可以是相对地址）',
      },
    },
  },
  {
    key: 'vertical_split',
    title: '垂直拆分',
    type: '数据处理',
    code: endent`
    import pandas as pd

    alice_columns = '{alice_columns}'.split(',')
    bob_columns = '{bob_columns}'.split(',')

    alldata_df = pd.read_csv('{data_path}')
    v_alice_df = alldata_df.loc[:, alice_columns]
    v_bob_df = alldata_df.loc[:, bob_columns]

    v_alice_df.to_csv('{v_alice_path}', index=True, index_label="id")
    v_bob_df.to_csv('{v_bob_path}', index=True, index_label="id")
    `,
    jsonSchema: {
      type: 'object',
      required: [
        'alice_columns',
        'bob_columns',
        'data_path',
        'v_alice_path',
        'v_bob_path',
      ],
      properties: {
        data_path: {
          type: 'string',
          title: '数据地址',
          default: '',
        },
        alice_columns: {
          type: 'string',
          title: '文件一列名',
          default: '',
        },
        bob_columns: {
          type: 'string',
          title: '文件二列名',
          default: '',
        },
        v_alice_path: {
          type: 'string',
          title: '文件一地址',
          default: '',
        },
        v_bob_path: {
          type: 'string',
          title: '文件二地址',
          default: '',
        },
      },
    },
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: true,
      },
      data_path: {
        'ui:autofocus': true,
        'ui:description': '填写待拆分的数据地址。（可以是相对地址）',
      },
      alice_columns: {
        'ui:description': '文件一包含哪些列，列名之间用逗号分隔。',
      },
      bob_columns: {
        'ui:description': '文件二包含哪些列，列名之间用逗号分隔。',
      },
      v_alice_path: {
        'ui:description': '文件一地址。（可以是相对地址）',
      },
      v_bob_path: {
        'ui:description': '文件二地址。（可以是相对地址）',
      },
    },
  },
];
