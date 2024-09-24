// Keybinds instruction drawer on the right.

import { l10n } from '@difizen/mana-l10n';
import { isMacintosh } from '@difizen/mana-common';
import { Divider, Drawer, Table, Tag, Tooltip } from 'antd';
import { KeyboardIcon } from 'lucide-react';
import { useState } from 'react';

import './index.less';
import { withId } from '@/utils';

interface Keybind {
  combo: string[];
  description: string;
}
const CmdOrCtrl = isMacintosh ? 'Cmd' : 'Ctrl';
const OptionOrAlt = isMacintosh ? 'Option' : 'Alt';
export const Keybinds = withId<Keybind>([
  { combo: [CmdOrCtrl, 'S'], description: l10n.t('保存 Notebook') },
  { combo: [CmdOrCtrl, 'Enter'], description: l10n.t('运行 Cell') },
  { combo: ['Shift', 'S'], description: l10n.t('运行并选择下一个 Cell') },
  { combo: [OptionOrAlt, 'S'], description: l10n.t('运行并新增 Cell') },
  { combo: [CmdOrCtrl, "'"], description: l10n.t('显示/隐藏代码') },
  { combo: [CmdOrCtrl, 'O'], description: l10n.t('显示/隐藏输出') },
  { combo: ['A'], description: l10n.t('向下新增 Cell') },
  { combo: ['B'], description: l10n.t('向上新增 Cell') },
  {
    combo: [CmdOrCtrl, 'Shift', '↑/↓'],
    description: l10n.t('上下移动 Cell'),
  },
  {
    combo: [OptionOrAlt, '↑/↓'],
    description: l10n.t('上下移动行'),
  },
  { combo: ['D D'], description: l10n.t('删除 Cell') },
  { combo: ['C'], description: l10n.t('复制 Cell') },
  { combo: ['X'], description: l10n.t('剪切 Cell') },
  { combo: ['V'], description: l10n.t('粘贴 Cell') },
  { combo: ['Y'], description: l10n.t('转为 Code Cell') },
  { combo: ['M'], description: l10n.t('转为 Markdown Cell') },
]);

interface MagicCommand {
  command: string;
  description: string;
}
export const MagicCommands = withId<MagicCommand>([
  {
    command: '%timeit <code>',
    description: l10n.t('测试单行代码运行时间'),
  },
  {
    command: '%%timeit',
    description: l10n.t('测试 Cell 运行时间'),
  },
  {
    command: '%pwd',
    description: l10n.t('显示当前工作目录'),
  },
  {
    command: '%ls',
    description: l10n.t('列出当前目录下的文件'),
  },
  {
    command: '%whos',
    description: l10n.t('显示所有全局变量信息'),
  },
  {
    command: '%env',
    description: l10n.t('显示所有环境变量'),
  },
]);

export const KeybindInstruction = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title={l10n.t('快捷键和 Magic 命令')} placement="bottom">
        <KeyboardIcon
          onClick={() => setOpen((v) => !v)}
          size={18}
          className="libro-top-toolbar-custom-icon"
        />
      </Tooltip>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={l10n.t('快捷键和 Magic 命令')}
        width={480}
      >
        <Table
          size="small"
          pagination={false}
          dataSource={Keybinds}
          columns={[
            {
              title: l10n.t('快捷键'),
              dataIndex: 'combo',
              key: 'combo',
              render: (_, record) =>
                record.combo.map((item, idx) => (
                  <Tag key={`${record.id}-${idx}`}>{item}</Tag>
                )),
            },
            {
              title: l10n.t('功能'),
              dataIndex: 'description',
              key: 'description',
            },
          ]}
        ></Table>
        <Divider style={{ marginBlock: '8px', visibility: 'hidden' }} />
        <Table
          size="small"
          pagination={false}
          dataSource={MagicCommands}
          columns={[
            {
              title: l10n.t('Magic 命令'),
              dataIndex: 'command',
              key: 'command',
              render: (_, record) => (
                <pre key={record.id} style={{ fontSize: '12px' }}>
                  {record.command}
                </pre>
              ),
            },
            {
              title: l10n.t('功能'),
              dataIndex: 'description',
              key: 'description',
            },
          ]}
        ></Table>
      </Drawer>
    </>
  );
};
