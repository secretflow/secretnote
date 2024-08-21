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
  Space,
  Spin,
  Typography,
} from 'antd';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { genericErrorHandler, invert, randomColorByName } from '@/utils';
import { ServerStatus } from '../server';
import './index.less';
import type { Node, NodeStatusTag } from './service';
import { NodeService } from './service';

const { Paragraph } = Typography;

/**
 * Format the node status to a badge.
 */
const formatNodeStatus = (
  node: Node,
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
const NodeDetails = (props: { node: Node }) => {
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
      await method(id);
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
          <Descriptions.Item label={l10n.t('名称')}>
            {node.name}
          </Descriptions.Item>
          <Descriptions.Item label={l10n.t('状态')}>
            <Badge status={status} text={text} />
          </Descriptions.Item>
          <Descriptions.Item label={l10n.t('IP')}>
            <Paragraph copyable={!!node.podIp}>
              {node.podIp || l10n.t('暂无数据')}
            </Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label={l10n.t('镜像')}>
            {node.versions?.image || l10n.t('暂无数据')}
          </Descriptions.Item>
          <Descriptions.Item label={l10n.t('Python 和 SecretFlow 版本')}>
            {node.versions?.python || l10n.t('暂无数据')} /{' '}
            {node.versions?.secretflow || l10n.t('暂无数据')}
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
  const instance = useInject<NodeView>(ViewInstance);
  const service = instance.service;

  const addNode = () => {
    form
      .validateFields()
      .then(async (values) => {
        setAddLoading(true);

        try {
          const server = await service.addNode(values);
          if (server.status === ServerStatus.Succeeded) {
            message.success(l10n.t('节点添加成功'));
          } else {
            message.info('节点添加成功，但是节点处于离线状态，请联系管理员');
          }
        } catch (e) {
          genericErrorHandler(e);
        }

        setAddFormVisible(false);
        form.resetFields();
        setAddLoading(false);
        return;
      })
      .catch(() => {
        //
      });
  };

  const addNodeFormContent = (
    <div className="secretnote-add-node">
      <Form
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
        >
          <Input placeholder="alice" />
        </Form.Item>
        <Form.Item
          wrapperCol={{ offset: 4, span: 20 }}
          style={{ marginBottom: 0 }}
        >
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              onClick={() => {
                addNode();
              }}
              loading={addLoading}
            >
              {l10n.t('添加')}
            </Button>
          </Space>
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
            // @ts-ignore
            content={<NodeDetails node={node} />}
            title=""
            overlayStyle={{ width: 380 }}
            trigger="click"
            placement="bottomLeft"
            arrow={false}
          >
            {/* @ts-ignore */}
            <Badge status={formatNodeStatus(node).status} dot offset={[-28, 4]}>
              <Avatar
                shape="square"
                style={{
                  backgroundColor: randomColorByName(node.name),
                  cursor: 'pointer',
                }}
              >
                <span style={{ color: invert(randomColorByName(node.name)) }}>
                  {node.name.slice(0, 1).toUpperCase()}
                </span>
              </Avatar>
            </Badge>
          </Popover>
        ))}
      </Avatar.Group>
      <Popover
        content={addNodeFormContent}
        title=""
        overlayStyle={{ width: 446 }}
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
