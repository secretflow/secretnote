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
  Form,
  Input,
  message,
  Popover,
  Space,
} from 'antd';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import React from 'react';

import { invert } from '@/utils';

import { ServerStatus } from '../server';

import './index.less';
import type { Node, ServerStatusTag } from './service';
import { NodeService } from './service';

const getNodeStatus = (node: Node): { status: ServerStatusTag; text: string } => {
  const status = node.status;
  if (status === ServerStatus.Running || status === ServerStatus.Succeeded) {
    return {
      status: 'success',
      text: l10n.t('在线'),
    };
  }

  if (status === ServerStatus.Pending) {
    return {
      status: 'processing',
      text: l10n.t('启动中'),
    };
  }

  return {
    status: 'error',
    text: l10n.t('离线'),
  };
};

const NodeDetails = (props: { node: Node }) => {
  const { node } = props;
  const instance = useInject<NodeView>(ViewInstance);
  const { status, text } = getNodeStatus(node);
  // const [editableStr, setEditableStr] = useState(node.name);

  const deleteNode = async (id: string) => {
    try {
      await instance.service.deleteNode(id);
      message.success(l10n.t('删除成功'));
    } catch (e) {
      if (e instanceof Error) {
        message.error(e.message);
      }
    }
  };

  // const onChangeNodeName = async (n: Node, name: string) => {
  //   if (n.name === name) {
  //     return;
  //   }
  //   try {
  //     await instance.service.updateNodeName(n.id, name);
  //     setEditableStr(name);
  //   } catch (e) {
  //     if (e instanceof Error) {
  //       message.error(e.message);
  //     }
  //   }
  // };

  return (
    <div className="secretnote-node-description">
      <Descriptions title={l10n.t('节点信息')} column={1}>
        <Descriptions.Item label={l10n.t('名称')}>
          {node.name}
          {/* <Paragraph
            editable={{
              onChange: (str: string) => onChangeNodeName(node, str),
              tooltip: false,
            }}
          >
            {editableStr}
          </Paragraph> */}
        </Descriptions.Item>
        <Descriptions.Item label={l10n.t('状态')}>
          <Badge status={status} text={text} />
        </Descriptions.Item>
      </Descriptions>
      <Button
        type="link"
        onClick={() => {
          deleteNode(node.id);
        }}
      >
        {l10n.t('删除')}
      </Button>
    </div>
  );
};

export const NodeComponent = () => {
  const [form] = Form.useForm();
  const [addFormVisible, setAddFormVisible] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const instance = useInject<NodeView>(ViewInstance);

  const addNode = () => {
    form
      .validateFields()
      .then(async (values) => {
        setAddLoading(true);

        try {
          const server = await instance.service.addNode(values);
          if (server.status === ServerStatus.Succeeded) {
            message.success(l10n.t('节点添加成功'));
          } else {
            message.info('节点添加成功，但是节点处于离线状态');
          }
        } catch (e) {
          if (e instanceof Error) {
            message.error(e.message);
          }
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
            { pattern: /^[A-Za-z]+$/, message: l10n.t('名称只能包含英文字母') },
          ]}
        >
          <Input placeholder="alice" />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 4, span: 20 }} style={{ marginBottom: 0 }}>
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
      <Avatar.Group>
        {instance.service.nodes.map((item) => (
          <Popover
            key={item.id}
            content={<NodeDetails node={item} />}
            title=""
            overlayStyle={{ width: 280 }}
            trigger="click"
            placement="bottomLeft"
            arrow={false}
          >
            <Badge status={getNodeStatus(item).status} dot offset={[-28, 4]}>
              <Avatar
                shape="square"
                style={{ backgroundColor: item.color, cursor: 'pointer' }}
              >
                <span style={{ color: invert(item.color) }}>
                  {item.name.slice(0, 1).toUpperCase()}
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
        {instance.service.nodes.length < 2 && (
          <Button
            icon={<Plus size={16} />}
            className="btn"
            onClick={() => setAddFormVisible(true)}
          />
        )}
      </Popover>
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
