// This is the ribbon on the top-right corner of each code cell used for selecting parties.

import { l10n } from '@difizen/mana-l10n';
import { Badge, Popover, Space, Tag } from 'antd';
import React from 'react';
import './index.less';

interface RibbonProps {
  children: React.ReactNode;
  items: { label: string; key: string }[]; // selectable parties that are already added nodes
  value: string[]; // selected parties that is saved in the metadata of the cell execution
  onChange?: (value: string[]) => void;
  readonly?: boolean;
}

const { CheckableTag } = Tag;

function Ribbon(props: RibbonProps) {
  const { items, value, onChange, readonly } = props;

  const handleChange = (tag: string, checked: boolean) => {
    if (readonly) {
      return;
    }
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
              <div className="title">{l10n.t('请选择要执行该代码的节点列表')}</div>
              <Space size={[0, 8]} wrap>
                {items.length
                  ? items.map((item) => (
                      <CheckableTag
                        style={{
                          userSelect: 'none',
                          border: '1px solid #d9d9d9',
                        }}
                        key={item.key}
                        checked={value.includes(item.key)}
                        onChange={(checked) => handleChange(item.key, checked)}
                      >
                        {item.label}
                      </CheckableTag>
                    ))
                  : l10n.t('还未拉起任何节点')}
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
