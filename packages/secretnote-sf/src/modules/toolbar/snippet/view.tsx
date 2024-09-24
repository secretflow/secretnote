// Snippet component.

import { l10n } from '@difizen/mana-l10n';
import { Collapse, Drawer, Flex, Table, Tooltip } from 'antd';
import { ArrowUpSquareIcon, CodeIcon } from 'lucide-react';
import { useState } from 'react';
import endent from 'endent';

import './index.less';

interface ISnippet {
  key: string;
  label: string;
  code: string;
}
export const snippets: ISnippet[] = [
  {
    key: 'sim_2pc',
    label: l10n.t('单机仿真 2PC'),
    code: endent`sf.init(parties=["alice", "bob"], address="local")`,
  },
  {
    key: 'sim_3pc',
    label: l10n.t('单机仿真 3PC'),
    code: endent`sf.init(parties=["alice", "bob", "carol"], address="local")`,
  },
  {
    key: 'cluster_2pc',
    label: l10n.t('多机集群 3PC'),
    code: endent`
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
    key: 'create_pyu',
    label: l10n.t('创建 PYU'),
    code: endent`alice, bob = sf.PYU("alice"), sf.PYU("bob")`,
  },
  {
    key: 'create_spu',
    label: l10n.t('创建 SPU'),
    code: endent`
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
    key: 'psi',
    label: l10n.t('隐私求交 PSI'),
    code: endent`
    cwd = os.getcwd()
    input_path = { alice: f"{cwd}/alice.csv", bob: f"{cwd}/bob.csv", }
    output_path = { alice: f"{cwd}/alice_out.csv", bob: f"{cwd}/bob_out.csv", }
    spu.psi_csv("<key>", input_path, output_path, "<receiver>",
                protocol="KKRT_PSI_2PC", curve_type="CURVE_25519")
    `,
  },
  {
    key: 'show_internal_version',
    label: l10n.t('查看内部组件版本'),
    code: endent`
    !python --version
    sf.__version__`,
  },
  {
    key: 'install_package',
    label: l10n.t('安装 Python 包'),
    code: endent`!pip install -i https://mirrors.aliyun.com/pypi/simple/ <package>`,
  },
  {
    key: 'load_iris_dataset',
    label: l10n.t('加载 iris 数据集'),
    code: endent`
    from sklearn import datasets
    iris = datasets.load_iris()`,
  },
  {
    key: 'load_breast_cancer_dataset',
    label: l10n.t('加载 breast_cancer 数据集'),
    code: endent`
    from sklearn import datasets
    breast_cancer = datasets.load_breast_cancer()`,
  },
] as const;

export const SnippetView = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title={l10n.t('常用代码段')} placement="bottom">
        <CodeIcon
          onClick={() => setOpen((v) => !v)}
          size={18}
          className="libro-top-toolbar-custom-icon"
        />
      </Tooltip>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={l10n.t('常用代码段')}
        width={480}
      >
        <Collapse
          className="snippet-collapse"
          items={snippets.map((v) => ({
            key: v.key,
            label: (
              <Flex justify="space-between" align="center">
                {v.label}
                <Tooltip title={l10n.t('应用到 Notebook')}>
                  <ArrowUpSquareIcon
                    size={14}
                    onClick={(e) => {
                      // navigator.clipboard.writeText(v.code);
                      e.preventDefault();
                      e.stopPropagation();
                      // TODO
                    }}
                  />
                </Tooltip>
              </Flex>
            ),
            children: <code>{v.code}</code>,
          }))}
        />
      </Drawer>
    </>
  );
};
