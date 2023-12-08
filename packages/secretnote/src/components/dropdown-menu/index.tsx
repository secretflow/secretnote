import type { MenuProps } from 'antd';
import { Dropdown } from 'antd';
import { MoreHorizontal } from 'lucide-react';
import './index.less';

export type Menu = Required<MenuProps>['items'][number];

interface IProps {
  items: Menu[];
  onClick?: (key: string) => void;
  trigger?: ('click' | 'hover' | 'contextMenu')[];
  icon?: React.ReactNode;
}

function DropdownMenu(props: IProps) {
  const { items, onClick, icon, trigger } = props;

  if (items.length === 0) {
    return null;
  }

  return (
    <Dropdown
      placement="bottomLeft"
      menu={{
        items: items,
        onClick: ({ key, domEvent }) => {
          domEvent.stopPropagation();
          if (onClick) {
            onClick(key);
          }
        },
      }}
      overlayClassName="secretnote-dropdown-menu"
      trigger={trigger || ['click']}
    >
      <span onClick={(e) => e.stopPropagation()}>
        {icon ? icon : <MoreHorizontal size={14} />}
      </span>
    </Dropdown>
  );
}

export { DropdownMenu };
