import {
  BaseView,
  inject,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
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
  Typography,
} from 'antd';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { ERROR_CODE, getErrorMessage, invert } from '@/utils';

import { ServerStatus } from '../server';

import './index.less';
import type { Node, ServerStatusTag } from './service';
import { NodeService } from './service';

const { Paragraph } = Typography;

const getNodeStatus = (
  node: Node,
): { status: ServerStatusTag; badgeStatus: ServerStatusTag; text: string } => {
  const status = node.status;
  if (status === ServerStatus.running) {
    return {
      status: 'success',
      badgeStatus: 'success',
      text: 'Online',
    };
  }
  if (status === ServerStatus.error) {
    return {
      status: 'error',
      badgeStatus: 'error',
      text: 'Offline',
    };
  }
  return {
    status: 'default',
    badgeStatus: 'default',
    text: 'Offline',
  };
};

const NodeDetails = (props: { node: Node }) => {
  const { node } = props;
  const instance = useInject<NodeView>(ViewInstance);
  const { status, text } = getNodeStatus(node);
  const [editableStr, setEditableStr] = useState(node.name);

  const deleteNode = async (id: string) => {
    await instance.service.deleteNode(id);
    message.success('Delete successfully.');
  };

  const onChangeNodeName = async (n: Node, name: string) => {
    await instance.service.updateNodeName(n.id, name);
    setEditableStr(name);
  };

  return (
    <div className="secretnote-node-description">
      <Descriptions title="Node Information" column={1}>
        <Descriptions.Item label="Name">
          <Paragraph
            editable={{
              onChange: (str: string) => onChangeNodeName(node, str),
              tooltip: false,
            }}
          >
            {editableStr}
          </Paragraph>
        </Descriptions.Item>
        <Descriptions.Item label="Address">{node.address}</Descriptions.Item>
        <Descriptions.Item label="Status">
          <Badge status={status} text={text} />
        </Descriptions.Item>
      </Descriptions>
      {!node.master && (
        <Button
          type="link"
          onClick={() => {
            deleteNode(node.id);
          }}
        >
          Delete
        </Button>
      )}
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
        const code = await instance.service.addNode(values);
        if (code !== ERROR_CODE.NO_ERROR) {
          message.error(getErrorMessage(code));
        } else {
          setAddFormVisible(false);
          form.resetFields();
          message.success('Node add successfully.');
        }
        setAddLoading(false);
        return code;
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
        initialValues={{ name: '', address: '' }}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[
            { required: true, message: 'Please input name' },
            { max: 16, message: 'Name is too long' },
          ]}
        >
          <Input placeholder="Bob" />
        </Form.Item>
        <Form.Item
          label="Address"
          name="address"
          rules={[
            { required: true, message: 'Please input address' },
            { max: 100, message: 'Address is too long' },
          ]}
        >
          <Input placeholder="127.0.0.1:8889" />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 4, span: 20 }}>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              onClick={() => {
                addNode();
              }}
              loading={addLoading}
            >
              Add
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
            overlayClassName="secretnote-node-popover"
            overlayStyle={{ width: 280, paddingTop: 0 }}
            trigger="click"
            placement="bottomLeft"
          >
            <Badge status={getNodeStatus(item).badgeStatus} dot offset={[-28, 4]}>
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
        overlayClassName="secretnote-node-popover"
        overlayStyle={{ width: 446, paddingTop: 0 }}
        trigger="click"
        placement="bottomLeft"
        open={addFormVisible}
        onOpenChange={(visible) => {
          form.resetFields();
          setAddFormVisible(visible);
        }}
      >
        <Button
          icon={<Plus size={16} />}
          className="btn"
          onClick={() => setAddFormVisible(true)}
        />
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
