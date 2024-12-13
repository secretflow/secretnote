import { l10n } from '@difizen/mana-l10n';
import { Badge, Popover, Space, Tag } from 'antd';
import React from 'react';
import './index.less';

interface RibbonProps {
  children: React.ReactNode;
  items: { label: string; key: string }[];
  value: string[];
  onChange?: (value: string[]) => void;
}

const { CheckableTag } = Tag;

function Ribbon(props: RibbonProps) {
  const { items, value, onChange } = props;

  const handleChange = (tag: string, checked: boolean) => {
    const nextSelectedTags = checked ? [...value, tag] : value.filter((t) => t !== tag);
    if (onChange) {
      onChange(nextSelectedTags);
    }
  };

  const getLabel = (values: string[]) => {
    const filtered = items.filter((item) => values.includes(item.key));
    if (!filtered.length) {
      return l10n.t('选择执行节点…');
    }
    return filtered.map((item) => item.label).join(', ');
  };

  return (
    <Badge.Ribbon
      text={
        <Popover
          placement="bottomRight"
          trigger={['click']}
          overlayStyle={{ paddingTop: 0 }}
          overlayClassName="secretnote-ribbon-popover"
          content={
            <>
              <div className="title">{l10n.t('请选择要执行该代码的节点列表')}:</div>
              <Space size={[0, 8]} wrap>
                {items.map((item) => (
                  <CheckableTag
                    style={{
                      userSelect: 'none',
                    }}
                    key={item.key}
                    checked={value.includes(item.key)}
                    onChange={(checked) => handleChange(item.key, checked)}
                  >
                    {item.label}
                  </CheckableTag>
                ))}
              </Space>
            </>
          }
        >
          <span className="secretnote-ribbon">{getLabel(value)}</span>
        </Popover>
      }
    >
      {props.children}
    </Badge.Ribbon>
  );
}

export { Ribbon };
