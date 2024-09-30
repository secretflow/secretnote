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
import type { TreeDataNode } from 'antd';
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
import { BrokerService, ColumnControl } from '@/modules/scql-broker';
import { getProjectId } from '@/utils/scql';
import { ProjectService } from '../scql-project/service';

const { DirectoryTree } = Tree;

const TableDetails = (props: { data?: any }) => {
  const { data } = props;
  const [tableCCL, setTableCCL] = useState<ColumnControl[]>([]);
  const instance = useInject<TableView>(ViewInstance);

  const getTableCCL = async (tableName: string) => {
    await instance.tableService.getTableCCL(tableName);
    // setTableCCL(ccl);
  };

  useEffect(() => {
    if (data) {
      getTableCCL(data.tableName);
    }
  }, [data]);

  if (!data) {
    return null;
  }

  const columns =
    tableCCL.length > 0
      ? Object.keys(tableCCL[0]).map((item) => {
          if (item === 'column') {
            return {
              title: 'Column',
              dataIndex: 'column',
              key: 'column',
            };
          }
          return {
            title: `Grant to ${item}`,
            dataIndex: item,
            key: item,
            render: (text: string) => text || '-',
          };
        })
      : [];

  return (
    <div className="secretnote-node-description">
      <Descriptions title={l10n.t('表信息')} column={1}>
        <Descriptions.Item label={l10n.t('数据库类型')}>
          {data.dbType}
        </Descriptions.Item>
        <Descriptions.Item label={l10n.t('表名称')}>{data.tableName}</Descriptions.Item>
        <Descriptions.Item label={l10n.t('关联表')}>{data.refTable}</Descriptions.Item>
        <Descriptions.Item label={l10n.t('数据列')}>
          {data.columns.map((c: any) => c.name).join(', ')}
        </Descriptions.Item>
        <Descriptions.Item label="CCL">
          <Table
            className="secretnote-ccl-view-table"
            dataSource={tableCCL}
            rowKey="column"
            pagination={false}
            columns={columns}
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

  async function transformTablesToTreeNodes() {
    console.log('transformTablesToTreeNodes');

    const { members } = (await projectService.getProjectInfo(getProjectId()))!;
    const { tables } = tableService;
    const { party: selfParty } = brokerService.platformInfo;

    const _nodes: TreeDataNode[] = [];
    members.forEach((member) => {
      _nodes.push({
        key: member,
        title: member,
        children: tables.map((v) => ({
          key: `${v.tableName}-${member}`,
          title: v.tableName,
        })),
      });
    });

    return _nodes;
  }

  useEffect(() => {
    (async () => setNodes(await transformTablesToTreeNodes()))();
  }, [tableService.tables]);

  const onMenuClick = (key: string, node: any) => {
    switch (key) {
      case 'add':
        modalService.openModal(TableConfigModal);
        break;
      case 'configCCL':
        modalService.openModal(CCLConfigModal, node.data);
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
            await brokerService.dropTable(getProjectId(), node.tableName);
            message.success(l10n.t('数据表已删除'));
            return close(Promise.resolve);
          },
        });
        break;
    }
  };

  const titleRender = (nodeData: any) => {
    console.log('rendering...', nodeData);

    const { isLeaf, belongToMe } = nodeData;

    const folderMenuItems: Menu[] = belongToMe
      ? [{ key: 'add', label: '添加数据表', icon: <PlusSquare size={12} /> }]
      : [{ key: 'add', label: '添加数据表', icon: <PlusSquare size={12} /> }];

    const dataMenuItems: Menu[] = belongToMe
      ? [
          { key: 'configCCL', label: '配置 CCL', icon: <Settings size={12} /> },
          { type: 'divider' },
          {
            key: 'delete',
            label: l10n.t('删除'),
            icon: <Trash size={12} />,
            danger: true,
          },
        ]
      : [{ key: 'add', label: '添加数据表', icon: <PlusSquare size={12} /> }];

    const title = (
      <div className="ant-tree-title-content">
        <span className="title">
          <Space>
            {isLeaf && <TableProperties size={16} />}
            <span>{nodeData.title as string}</span>
          </Space>
        </span>
        <DropdownMenu
          items={isLeaf ? dataMenuItems : folderMenuItems}
          onClick={(key) => onMenuClick(key, nodeData)}
        />
      </div>
    );

    if (!isLeaf) {
      return title;
    }

    return (
      <Popover
        placement="rightTop"
        align={{ offset: [10, 0] }}
        arrow={false}
        overlayStyle={{ maxWidth: 520 }}
        content={<TableDetails data={nodeData.data} />}
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
