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
import { message, Modal, Space, Tree, Popover, Descriptions, Typography } from 'antd';
import { ChevronDown, Trash, Plus, TableProperties, Settings } from 'lucide-react';

import { DropdownMenu } from '@/components/dropdown-menu';
import type { Menu } from '@/components/dropdown-menu';
import { SideBarContribution } from '@/modules/layout';

import './index.less';
import { DataTableConfigModal } from './add-modal';
import { CCLConfigModal } from './ccl-modal';
import { DataTableService, type DataTableNode, type DataTable } from './service';

const { DirectoryTree } = Tree;

const DataTableDetails = (props: { data?: DataTable }) => {
  const { data } = props;

  if (!data) {
    return null;
  }

  return (
    <div className="secretnote-node-description">
      <Descriptions title="表信息" column={1}>
        <Descriptions.Item label="表名称">{data.tableName}</Descriptions.Item>
        <Descriptions.Item label="数据库类型">{data.dbType}</Descriptions.Item>
        <Descriptions.Item label="关联表">{data.refTable}</Descriptions.Item>
        <Descriptions.Item label="数据列">
          {data.columns.map((c) => c.name).join(', ')}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export const DataTableComponent = () => {
  const instance = useInject<DataTableView>(ViewInstance);
  const service = instance.service;

  const onMenuClick = (key: string, node: DataTableNode) => {
    switch (key) {
      case 'add':
        instance.modalService.openModal(DataTableConfigModal);
        break;
      case 'ccl':
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
            await service.deleteDataTable(node);
            message.success('数据表已删除');
            return close(Promise.resolve);
          },
        });
        break;
      default:
        break;
    }
  };

  const titleRender = (nodeData: DataTableNode) => {
    const { isLeaf, editable } = nodeData;

    const folderMenuItems: Menu[] = editable
      ? [{ key: 'add', label: '添加数据表', icon: <Plus size={12} /> }]
      : [];

    const dataMenuItems: Menu[] = editable
      ? [
          { key: 'ccl', label: '配置 CCL', icon: <Settings size={12} /> },
          { type: 'divider' },
          {
            key: 'delete',
            label: l10n.t('删除'),
            icon: <Trash size={12} />,
            danger: true,
          },
        ]
      : [];

    const title = (
      <div className="secretnote-tree-title">
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
        arrow={false}
        overlayStyle={{ maxWidth: 360 }}
        overlayClassName="secret-table-detail-popover"
        content={<DataTableDetails data={nodeData.data} />}
      >
        {title}
      </Popover>
    );
  };

  return (
    <DirectoryTree
      blockNode
      onSelect={() => {
        // do nothing
      }}
      treeData={service.dataTables}
      className="secretnote-data-table-tree"
      switcherIcon={<ChevronDown size={12} />}
      icon={null}
      titleRender={titleRender}
    />
  );
};

export const dataTableViewKey = 'data-table';
@singleton({ contrib: [SideBarContribution, ModalContribution] })
@view('secretnote-data-table-view')
export class DataTableView
  extends BaseView
  implements SideBarContribution, ModalContribution
{
  readonly service: DataTableService;
  readonly modalService: ModalService;

  key = dataTableViewKey;
  label = '数据表';
  order = 2;
  defaultOpen = true;
  view = DataTableComponent;

  constructor(
    @inject(DataTableService) service: DataTableService,
    @inject(ModalService) modalService: ModalService,
  ) {
    super();
    this.service = service;
    this.modalService = modalService;
  }

  onViewMount(): void {
    this.service.getDataTables();
  }

  registerModals() {
    return [DataTableConfigModal, CCLConfigModal];
  }
}
