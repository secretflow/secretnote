// Customized CSV previewer using @antv/s2-react.

import { SheetComponent } from '@antv/s2-react';
import '@antv/s2-react/dist/s2-react.min.css';

import { parseCSV } from '@/utils';
import './index.less';
import { l10n } from '@difizen/mana-l10n';

export default function CSVPreviewer(props: {
  dataSource?: ReturnType<typeof parseCSV>;
}) {
  return (
    <SheetComponent
      adaptive={{
        width: true,
        height: true,
      }}
      sheetType="table"
      dataCfg={{
        fields: {
          columns: props.dataSource?.columns.map((v) => ({
            title: v,
            field: v,
          })),
        },
        data: props.dataSource ?? [],
      }}
      options={{
        seriesNumber: {
          enable: true,
          text: l10n.t('(序号)'),
        },
        style: {
          layoutWidthType: 'compact',
        },
      }}
    />
  );
}
