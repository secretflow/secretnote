import type { ModalItem, ModalItemProps } from '@difizen/mana-app';
import { useInject } from '@difizen/mana-app';
import { Form } from '@rjsf/antd';
import validator from '@rjsf/validator-ajv8';
import { Modal } from 'antd';
import { useState } from 'react';

import { CodeBlock } from '@/components/code-block';

import type { SnippetNode } from './protocol';
import { SnippetService } from './service';

const ConfigPanel = (props: ModalItemProps<SnippetNode>) => {
  const { visible, close, data } = props;
  const service = useInject<SnippetService>(SnippetService);
  const [formData, setFormData] = useState(null);

  const transformCode = (code: string) => {
    if (formData) {
      const keys = Object.keys(formData);
      keys.forEach((key) => {
        const reg = new RegExp(`{${key}}`, 'g');
        // eslint-disable-next-line no-param-reassign
        code = code.replace(reg, formData[key]);
      });
    }
    return code;
  };

  const onOk = () => {
    service.addSnippet({
      ...data,
      code: transformCode(data.code),
    });
    close();
  };

  return (
    <Modal
      open={visible}
      width={1000}
      bodyStyle={{ padding: 12 }}
      cancelText="取消"
      okText="确定并使用"
      destroyOnClose={true}
      title="代码片段配置"
      onOk={() => onOk()}
      onCancel={() => {
        close();
      }}
    >
      <div className="secretnote-snippet-config">
        <div className="code">
          <CodeBlock code={data.code} />
        </div>
        <div className="config">
          <Form
            formData={formData}
            schema={data.jsonSchema || {}}
            uiSchema={data.uiSchema}
            validator={validator}
            onChange={(e) => setFormData(e.formData)}
          />
        </div>
      </div>
    </Modal>
  );
};

export const SnippetConfigModal: ModalItem<SnippetNode> = {
  id: 'snippet-config-modal',
  component: ConfigPanel,
};
