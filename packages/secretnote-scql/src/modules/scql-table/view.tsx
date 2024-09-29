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
import { ColumnControl } from '../scql-broker';

const { DirectoryTree } = Tree;

const TableDetails = (props: { data?: any }) => {
  const { data } = props;
  const [tableCCL, setTableCCL] = useState<ColumnControl[]>([]);
  const instance = useInject<TableView>(ViewInstance);

  const getTableCCL = async (tableName: string) => {
    const { ccl } = await instance.tableService.getTableCCL(tableName);
    setTableCCL(ccl);
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
      <Descriptions title="表信息" column={1}>
        <Descriptions.Item label="数据库类型">{data.dbType}</Descriptions.Item>
        <Descriptions.Item label="表名称">{data.tableName}</Descriptions.Item>
        <Descriptions.Item label="关联表">{data.refTable}</Descriptions.Item>
        <Descriptions.Item label="数据列">
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
  const instance = useInject<TableView>(ViewInstance);
  const service = instance.tableService;

  const onMenuClick = (key: string, node: any) => {
    switch (key) {
      case 'add':
        instance.modalService.openModal(TableConfigModal);
        break;
      case 'configCCL':
        instance.modalService.openModal(CCLConfigModal, node.data);
        break;
      case 'delete':
        Modal.confirm({
          title: '删除数据表',
          centered: true,
          content: `数据表 ${node.title} 将被删除`,
          okText: '删除数据表',
          cancelText: l10n.t('取消'),
          okType: 'danger',
          async onOk(close) {
            // await instance.tableService.drop(node);
            message.success('数据表已删除');
            return close(Promise.resolve);
          },
        });
        break;
      default:
        break;
    }
  };

  const titleRender = (nodeData: any) => {
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
          onClick={(key) => {
            onMenuClick(key, nodeData);
          }}
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
      treeData={service.tables}
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
  readonly tableService: TableService;
  readonly modalService: ModalService;

  key = tableViewKey;
  label = l10n.t('数据表');
  order = 2;
  defaultOpen = true;
  view = TableComponent;

  constructor(
    @inject(TableService) tableService: TableService,
    @inject(ModalService) modalService: ModalService,
  ) {
    super();
    this.tableService = tableService;
    this.modalService = modalService;
  }

  onViewMount() {
    this.tableService.refreshTables();
  }

  registerModals() {
    return [TableConfigModal, CCLConfigModal];
  }
}
