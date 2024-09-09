// The node management popover component.

import {
  BaseView,
  inject,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import {
  Avatar,
  Badge,
  Button,
  Descriptions,
  Divider,
  Form,
  Input,
  message,
  Popover,
  Progress,
  Space,
  Spin,
  Typography,
} from 'antd';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { genericErrorHandler, invert, randomColorByName, wait } from '@/utils';
import { ServerStatus } from '../server';
import './index.less';
import type { NodeStatusTag, SecretNoteNode } from './service';
import { NodeService } from './service';

const { Paragraph } = Typography;

/**
 * Format the node status to a badge.
 */
const formatNodeStatus = (
  node: SecretNoteNode,
): { status: NodeStatusTag; text: string } => {
  const { status } = node;
  if (status === ServerStatus.Pending) {
    return {
      status: 'processing',
      text: l10n.t('启动中'),
    };
  }
  if (status === ServerStatus.Succeeded || status === ServerStatus.Running) {
    return {
      status: 'success',
      text: l10n.t('在线'),
    };
  }
  return {
    status: 'error',
    text: l10n.t('离线'),
  };
};

/**
 * The detailed information component of a node.
 */
const NodeDetails = (props: { node: SecretNoteNode }) => {
  const instance = useInject<NodeView>(ViewInstance);
  const service = instance.service;
  const { node } = props;
  const { status, text } = formatNodeStatus(node);
  const [loading, setLoading] = useState(false);

  /**
   * Alter the status of a node.
   */
  const altNode = async (
    method: (id: string) => Promise<void>,
    id: string,
    successText: string,
  ) => {
    setLoading(true);
    try {
      await method.call(service, id);
      message.success(l10n.t(successText));
    } catch (e) {
      genericErrorHandler(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="secretnote-node-description">
      <Spin spinning={loading}>
        <Descriptions title={l10n.t('节点信息')} column={1}>
          <Descriptions.Item label={l10n.t('名称')}>{node.name}</Descriptions.Item>
          <Descriptions.Item label={l10n.t('状态')}>
            <Badge status={status} text={text} />
          </Descriptions.Item>
          <Descriptions.Item label={l10n.t('IP')}>
            <Paragraph copyable={!!node.podIp}>
              {node.podIp || l10n.t('暂无数据')}
            </Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label={l10n.t('CPU 和内存配额')}>
            {`${node.resourcesAndVersions?.cpu}C` || l10n.t('暂无数据')} /{' '}
            {node.resourcesAndVersions?.memory || l10n.t('暂无数据')}
          </Descriptions.Item>
          <Descriptions.Item label={l10n.t('镜像')}>
            {node.resourcesAndVersions?.image || l10n.t('暂无数据')}
          </Descriptions.Item>
          <Descriptions.Item label={l10n.t('Python 和 SecretFlow 版本')}>
            {node.resourcesAndVersions?.python || l10n.t('暂无数据')} /{' '}
            {node.resourcesAndVersions?.secretflow || l10n.t('暂无数据')}
          </Descriptions.Item>
        </Descriptions>
        <Divider style={{ marginTop: '0', marginBottom: '1em' }} />
        <Space>
          <Button
            type="default"
            danger
            onClick={() => altNode(service.deleteNode, node.id, '删除成功')}
          >
            {l10n.t('删除')}
          </Button>
          {node.status === ServerStatus.Terminated && (
            <Button
              type="primary"
              onClick={() => altNode(service.startNode, node.id, '启动成功')}
            >
              {l10n.t('启动')}
            </Button>
          )}
          {node.status === ServerStatus.Succeeded && (
            <Button
              type="default"
              onClick={() => altNode(service.stopNode, node.id, '停止成功')}
            >
              {l10n.t('停止')}
            </Button>
          )}
        </Space>
      </Spin>
    </div>
  );
};

export const NodeComponent = () => {
  const [form] = Form.useForm();
  const [addFormVisible, setAddFormVisible] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addProgress, setAddProgress] = useState(0);
  const instance = useInject<NodeView>(ViewInstance);
  const service = instance.service;

  const handleAddNode = async () => {
    const values = await form.validateFields();
    setAddLoading(true);
    // Simulate the progress of adding a node
    const interval = setInterval(
      () => setAddProgress((prev) => (prev >= 95 ? prev : Math.min(prev + 3, 95))),
      1000, // ~30s in total
    );
    try {
      const server = await service.addNode(values);
      if (server.status === ServerStatus.Succeeded) {
        message.success(l10n.t('节点添加成功'));
      } else {
        message.info(l10n.t('节点添加成功，但处于离线状态，请刷新页面或联系管理员'));
      }
      setAddProgress(100);
      await wait(1000);
    } catch (e) {
      genericErrorHandler(e);
    } finally {
      setAddLoading(false);
      clearInterval(interval);
      form.resetFields();
      setAddProgress(0);
      setAddFormVisible(false);
    }
  };

  const addNodeFormContent = (
    <div className="secretnote-add-node">
      <div className="title">{l10n.t('添加节点')}</div>
      <Form
        labelAlign="left"
        form={form}
        autoComplete="off"
        requiredMark={false}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        initialValues={{ name: '', address: '', type: 'common' }}
      >
        <Form.Item
          label={l10n.t('名称')}
          name="name"
          rules={[
            { required: true, message: l10n.t('请输入名称') },
            { max: 16, message: l10n.t('名称过长') },
            {
              pattern: /^[a-z]+$/,
              message: l10n.t('名称只能包含小写英文字母'),
            },
          ]}
          style={{ marginBottom: '12px' }}
        >
          <Input placeholder="alice" />
        </Form.Item>
        <Form.Item
          label={l10n.t('地址')}
          name="nodeAddress"
          rules={[
            {
              pattern: /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}\:\d{1,5}$/,
              message: l10n.t('格式不正确'),
            },
          ]}
          style={{ marginBottom: '12px' }}
        >
          <Input placeholder="127.0.0.1:8088" />
        </Form.Item>
        {addLoading && (
          <Form.Item
            wrapperCol={{ offset: 4, span: 20 }}
            style={{
              marginTop: '-12px',
              marginBottom: 0,
            }}
          >
            <Progress percent={addProgress} size="small" />
          </Form.Item>
        )}
        <Form.Item wrapperCol={{ offset: 4, span: 20 }} style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            onClick={handleAddNode}
            loading={addLoading}
          >
            {l10n.t('添加')}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );

  return (
    <div className="secretnote-node">
      <span className="title">节点列表:&nbsp;</span>
      <Avatar.Group>
        {service.nodes.map((node) => (
          <Popover
            key={node.id}
            content={<NodeDetails node={node} />}
            title=""
            overlayStyle={{ width: 380 }}
            trigger="click"
            placement="bottomLeft"
            arrow={false}
          >
            <Badge status={formatNodeStatus(node).status} dot offset={[-28, 4]}>
              <Avatar
                shape="square"
                style={{
                  backgroundColor: randomColorByName(node.name),
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    color: invert(randomColorByName(node.name)),
                    userSelect: 'none',
                  }}
                >
                  {node.name.slice(0, 1).toUpperCase()}
                </span>
              </Avatar>
            </Badge>
          </Popover>
        ))}
      </Avatar.Group>
      <Popover
        content={addNodeFormContent}
        overlayStyle={{ width: 360 }}
        trigger="click"
        placement="bottomLeft"
        open={addFormVisible}
        onOpenChange={(visible) => {
          form.resetFields();
          setAddFormVisible(visible);
        }}
        arrow={false}
      >
        {/* Add two nodes at most */}
        {instance.service.nodes.length < 2 && (
          <Button
            icon={<Plus size={16} />}
            className="btn"
            onClick={() => setAddFormVisible(true)}
          />
        )}
      </Popover>
      {instance.service.loading && <Spin size="small" className="ml-2" />}
    </div>
  );
};

@singleton()
@view('secretnote-node-view')
export class NodeView extends BaseView {
  view = NodeComponent;
  readonly service: NodeService;

  constructor(@inject(NodeService) service: NodeService) {
    super();
    this.service = service;
  }
}
