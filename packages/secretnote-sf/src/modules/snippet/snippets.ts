// Code snippets for SecretNote.

import { l10n } from '@difizen/mana-l10n';

interface Snippet {
  id: string;
  name: string;
  code: string;
}

const snippets: Snippet[] = [
  {
    id: 'sim_2pc',
    name: l10n.t('单机仿真 2PC'),
    code: `sf.init(parties=["alice", "bob"], address="local")`,
  },
  {
    id: 'sim_3pc',
    name: l10n.t('单机仿真 3PC'),
    code: `sf.init(parties=["alice", "bob", "carol"], address="local")`,
  },
  {
    id: 'cluster_2pc',
    name: l10n.t('多机集群 3PC'),
    code: `
    network_conf = {
      "parties": {
        "alice": { "address": "alice:8000", }, # <AliceIP>:<SECRETFLOW_PORT>
        "bob": { "address": "bob:8000", }, # <BobIP>:<SECRETFLOW_PORT>
      },
    }
    sf.init(
      address="127.0.0.1:6379", # <RayHeadIP>:<RAY_PORT>
      cluster_config={**network_conf, "self_party": os.getenv("SELF_PARTY")},
      log_to_driver=True,
    )`,
  },
  {
    id: 'create_pyu',
    name: l10n.t('创建 PYU'),
    code: `alice, bob = sf.PYU("alice"), sf.PYU("bob")`,
  },
  {
    id: 'create_spu',
    name: l10n.t('创建 SPU'),
    code: `
    cluster_def = {
      "nodes": [
        # <AliceIP>:<SPU_PORT>
        { "party": "alice", "address": "alice:8001", "listen_addr": "alice:8001", },
        # <BobIP>:<SPU_PORT>
        { "party": "bob", "address": "bob:8001", "listen_addr": "bob:8001", },
      ],
      "runtime_config": {
        "protocol": spu.spu_pb2.SEMI2K, # ABY3, CHEETAH
        "field": spu.spu_pb2.FM128, # FM64
        "sigmoid_mode": spu.spu_pb2.RuntimeConfig.SIGMOID_REAL,
      },
    }
    spu_ = sf.SPU(cluster_def=spu_conf)`,
  },
  {
    id: 'psi',
    name: l10n.t('隐私求交 PSI'),
    code: `
    cwd = os.getcwd()
    input_path = { alice: f"{cwd}/alice.csv", bob: f"{cwd}/bob.csv", }
    output_path = { alice: f"{cwd}/alice_out.csv", bob: f"{cwd}/bob_out.csv", }
    spu.psi_csv("<key>", input_path, output_path, "<receiver>",
                protocol="KKRT_PSI_2PC", curve_type="CURVE_25519")
    `,
  },
  {
    id: 'show_internal_version',
    name: l10n.t('查看内部组件版本'),
    code: `
    !python --version
    sf.__version__`,
  },
  {
    id: 'load_iris_dataset',
    name: l10n.t('加载 iris 数据集'),
    code: `
    from sklearn import datasets
    iris = datasets.load_iris()`,
  },
  {
    id: 'load_breast_cancer_dataset',
    name: l10n.t('加载 breast_cancer 数据集'),
    code: `
    from sklearn import datasets
    breast_cancer = datasets.load_breast_cancer()`,
  },
];

export default snippets;
