import { l10n } from '@difizen/mana-l10n';
import { Space, Spin } from 'antd';

interface IProps {
  style?: React.CSSProperties;
}
export default function BusySpin(props?: IProps) {
  return (
    <Space direction="horizontal" size="small" style={props?.style}>
      <Spin size="small" />
      {l10n.t('正忙…')}
    </Space>
  );
}
