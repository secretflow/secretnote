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
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { DropdownMenu } from '@/components/dropdown-menu';
import type { Menu } from '@/components/dropdown-menu';
import { SideBarContribution } from '@/modules/layout';
import './index.less';
import { TableConfigModal } from './add-modal';
import { CCLConfigModal } from './ccl-modal';
import { TableService } from './service';
import { noop } from 'lodash-es';
import { _Table, BrokerService, ColumnControl } from '@/modules/scql-broker';
import { getProjectId } from '@/utils/scql';
import { ProjectService } from '@/modules/scql-project/service';

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

  // Get the CCL of a specified table.
  const [tableCCL, setTableCCL] = useState<ColumnControl[]>([]);
  const tableService = useInject<TableService>(TableService);
  useEffect(() => {
    (async () => {
      table && setTableCCL((await tableService.getTableCCL(table.tableName)) || []);
    })();
  }, [table]);

  // tableCCL.length > 0
  //   ? Object.keys(tableCCL[0]).map((item) => {
  //       if (item === 'column') {
  //         return {
  //           title: 'Column',
  //           dataIndex: 'column',
  //           key: 'column',
  //         };
  //       }
  //       return {
  //         title: `Grant to ${item}`,
  //         dataIndex: item,
  //         key: item,
  //         render: (text: string) => text || '-',
  //       };
  //     })
  //   : [];

  return (
    <div className="secretnote-node-description">
      <Descriptions title={l10n.t('表信息')} column={2}>
        <Descriptions.Item label={l10n.t('表名称')}>
          {table.tableName}
        </Descriptions.Item>
        <Descriptions.Item label={l10n.t('所有方')}>
          {table.tableOwner}
        </Descriptions.Item>
        <Descriptions.Item label={l10n.t('数据库类型')}>
          {table.dbType}
        </Descriptions.Item>
        <Descriptions.Item label={l10n.t('关联物理表')}>
          {table.refTable}
        </Descriptions.Item>
        <Descriptions.Item label={l10n.t('数据列')} span={2}>
          {table.columns.map((c) => `${c.name} (${c.dtype})`).join(', ')}
        </Descriptions.Item>
        <Descriptions.Item label="CCL" span={2}>
          <Table
            className="secretnote-ccl-view-table"
            dataSource={tableCCL}
            rowKey="column"
            pagination={false}
            columns={[]}
            size="small"
          />
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export const TableComponent = () => {
  const [nodes, setNodes] = useState<TreeDataNode[]>([]);
  const instance = useInject<TableView>(ViewInstance);
  const { tableService, brokerService, projectService, modalService } = instance;

  /**
   * Transform the results of `listTables` action into AntD tree nodes.
   */
  async function transformTablesToTreeNodes() {
    const { members } = (await projectService.getProjectInfo(getProjectId()))!;
    await tableService.refreshTables();
    const { tables } = tableService;
    const { party: selfParty } = brokerService.platformInfo;

    const _nodes: TreeDataNode[] = [];
    members.forEach((member) => {
      const belongToMe = selfParty === member;
      _nodes.push({
        key: member,
        title: member,
        belongToMe,
        isLeaf: false,
        children: tables.map((table) => ({
          key: `${table.tableName}-${member}`,
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
    (async () => setNodes(await transformTablesToTreeNodes()))();
  }, []);

  const onMenuClick = (key: string, node: TreeDataNode) => {
    switch (key) {
      case 'add':
        modalService.openModal(TableConfigModal);
        break;
      case 'configCCL':
        modalService.openModal(CCLConfigModal, node.table);
        break;
      case 'delete':
        Modal.confirm({
          title: l10n.t('删除数据表'),
          centered: true,
          content: l10n.t('数据表 {0} 将被删除', node.title),
          okText: l10n.t('确认'),
          cancelText: l10n.t('取消'),
          okType: 'danger',
          async onOk(close) {
            await brokerService.dropTable(getProjectId(), node.table!.tableName);
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
      ? [{ key: 'add', label: l10n.t('添加数据表'), icon: <PlusSquare size={12} /> }]
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
      : [];

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
  readonly projectService: ProjectService;

  key = tableViewKey;
  label = l10n.t('数据表');
  order = 2;
  defaultOpen = true;
  view = TableComponent;

  constructor(
    @inject(BrokerService) brokerService: BrokerService,
    @inject(TableService) tableService: TableService,
    @inject(ModalService) modalService: ModalService,
    @inject(ProjectService) projectService: ProjectService,
  ) {
    super();
    this.brokerService = brokerService;
    this.tableService = tableService;
    this.modalService = modalService;
    this.projectService = projectService;
  }

  onViewMount() {
    this.tableService.refreshTables();
  }

  registerModals() {
    return [TableConfigModal, CCLConfigModal];
  }
}
