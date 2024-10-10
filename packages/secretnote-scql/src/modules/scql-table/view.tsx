// The view and components for SCQL table management.

import {
  BaseView,
  inject,
  singleton,
  useInject,
  view,
  ViewInstance,
  ModalContribution,
  ModalService,
} from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { message, Modal, Space, Tree, Popover, Descriptions, Table } from 'antd';
import type { TreeDataNode as _TreeDataNode } from 'antd';
import {
  ChevronDown,
  Trash,
  TableProperties,
  Settings,
  PlusSquare,
  Monitor,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { DropdownMenu } from '@/components/dropdown-menu';
import type { Menu } from '@/components/dropdown-menu';
import { SideBarContribution } from '@/modules/layout';
import { TableConfigModal } from './add-modal';
import { CCLConfigModal } from './ccl-modal';
import { TableService } from './service';
import { noop } from 'lodash-es';
import { _Table, BrokerService, ColumnControl } from '@/modules/scql-broker';
import { getProjectId } from '@/utils/scql';
import { ProjectService } from '@/modules/scql-project/service';
import './index.less';
import { MemberService } from '../scql-member/service';

const { DirectoryTree } = Tree;

type TreeDataNode = _TreeDataNode & {
  belongToMe: boolean;
  isLeaf: boolean;
  table?: _Table; // table payload for current node
  children?: TreeDataNode[];
};

/**
 * Table details to display when hovering a table node.
 */
const TableDetails = ({ table }: { table: _Table }) => {
  if (!table) {
    return null;
  }

  return (
    <Descriptions
      title={l10n.t('表信息')}
      column={2}
      size="small"
      className="secretnote-hover-table-info"
    >
      <Descriptions.Item label={l10n.t('表名称')}>{table.tableName}</Descriptions.Item>
      <Descriptions.Item label={l10n.t('所有方')}>{table.tableOwner}</Descriptions.Item>
      <Descriptions.Item label={l10n.t('数据库类型')}>{table.dbType}</Descriptions.Item>
      <Descriptions.Item label={l10n.t('关联物理表')}>
        {table.refTable}
      </Descriptions.Item>
      <Descriptions.Item label={l10n.t('数据列')} span={2}>
        {table.columns.map((c) => `${c.name} (${c.dtype})`).join(', ')}
      </Descriptions.Item>
    </Descriptions>
  );
};

export const TableComponent = () => {
  const [nodes, setNodes] = useState<TreeDataNode[]>([]);
  const instance = useInject<TableView>(ViewInstance);
  const { tableService, brokerService, memberService, modalService } = instance;

  /**
   * Transform the results of `listTables` action into AntD tree nodes.
   */
  function transformTablesToTreeNodes() {
    const { members } = memberService;
    const { tables } = tableService;
    const { party: selfParty } = brokerService.platformInfo;

    const _nodes: TreeDataNode[] = [];
    members.forEach((member) => {
      const belongToMe = selfParty === member.party;
      _nodes.push({
        key: member.party,
        title: member.party,
        belongToMe,
        isLeaf: false,
        children: tables.map((table) => ({
          key: `${table.tableName}-${member.party}`,
          title: table.tableName,
          belongToMe,
          isLeaf: true,
          table,
        })),
      });
    });

    return _nodes;
  }

  useEffect(() => {
    setNodes(transformTablesToTreeNodes());
  }, [memberService.members, tableService.tables]);

  const onMenuClick = (key: string, node: TreeDataNode) => {
    switch (key) {
      case 'add':
        modalService.openModal(TableConfigModal);
        break;
      case 'configCCL':
        // @see props of CCLModalComponent
        modalService.openModal(CCLConfigModal, { table: node.table, mode: 'config' });
        break;
      case 'viewCCL':
        modalService.openModal(CCLConfigModal, { table: node.table, mode: 'view' });
        break;
      case 'delete':
        Modal.confirm({
          title: l10n.t('删除数据表'),
          centered: true,
          content: l10n.t('数据表 {0} 将被删除', node.table?.tableName || '??'),
          okText: l10n.t('确认'),
          cancelText: l10n.t('取消'),
          okType: 'danger',
          async onOk(close) {
            await brokerService.dropTable(getProjectId(), node.table!.tableName);
            await tableService.refreshTables();
            message.success(l10n.t('数据表已删除'));
            return close(Promise.resolve);
          },
        });
        break;
    }
  };

  /**
   * Render the title of a tree node.
   */
  const titleRender = (nodeData: TreeDataNode) => {
    const { isLeaf, belongToMe } = nodeData;
    // menu items for a party node
    const partyMenuItems: Menu[] = belongToMe
      ? [{ key: 'add', label: l10n.t('新建数据表'), icon: <PlusSquare size={12} /> }]
      : [];
    // menu items for a table node
    const leafMenuItems: Menu[] = belongToMe
      ? [
          { key: 'configCCL', label: l10n.t('配置 CCL'), icon: <Settings size={12} /> },
          { type: 'divider' },
          {
            key: 'delete',
            label: l10n.t('删除数据表'),
            icon: <Trash size={12} />,
            danger: true,
          },
        ]
      : [{ key: 'viewCCL', label: l10n.t('查看 CCL'), icon: <Monitor size={12} /> }];

    const title = (
      <div className="ant-tree-title-content">
        <span className="title">
          <Space>
            {isLeaf && <TableProperties size={16} />}
            <span>{nodeData.title as string}</span>
          </Space>
        </span>
        <DropdownMenu
          items={isLeaf ? leafMenuItems : partyMenuItems}
          onClick={(key) => onMenuClick(key, nodeData)}
        />
      </div>
    );

    if (!isLeaf) {
      return title;
    }
    // include a popover to display details when hovering over a table
    return (
      <Popover
        placement="rightTop"
        align={{ offset: [10, 0] }}
        arrow={false}
        overlayStyle={{ maxWidth: 520 }}
        content={<TableDetails table={nodeData.table!} />}
        trigger="hover"
        destroyTooltipOnHide
      >
        {title}
      </Popover>
    );
  };

  return (
    <DirectoryTree
      blockNode
      onSelect={noop}
      treeData={nodes}
      className="secretnote-data-table-tree"
      switcherIcon={<ChevronDown size={12} />}
      icon={null}
      titleRender={titleRender}
      defaultExpandAll
    />
  );
};

export const tableViewKey = 'scql-table';
@singleton({ contrib: [SideBarContribution, ModalContribution] })
@view('secretnote-data-table-view')
export class TableView
  extends BaseView
  implements SideBarContribution, ModalContribution
{
  readonly brokerService: BrokerService;
  readonly tableService: TableService;
  readonly modalService: ModalService;
  readonly memberService: MemberService;

  key = tableViewKey;
  label = l10n.t('数据表');
  order = 2;
  defaultOpen = true;
  view = TableComponent;

  constructor(
    @inject(BrokerService) brokerService: BrokerService,
    @inject(TableService) tableService: TableService,
    @inject(ModalService) modalService: ModalService,
    @inject(MemberService) memberService: MemberService,
  ) {
    super();
    this.brokerService = brokerService;
    this.tableService = tableService;
    this.modalService = modalService;
    this.memberService = memberService;
  }

  onViewMount() {
    this.tableService.refreshTables();
  }

  registerModals() {
    return [TableConfigModal, CCLConfigModal];
  }
}
