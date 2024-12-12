// Customized CSV previewer using @antv/s2-react.
// TODO

import { SheetComponent } from '@antv/s2-react';
import '@antv/s2-react/dist/s2-react.min.css';

import { parseCSV } from '@/utils';

export default function CSVPreviewer(props: { data: string }) {
  const dataSource = parseCSV(props.data || '');

  return (
    <SheetComponent
      adaptive
      sheetType="table"
      dataCfg={{
        fields: {
          columns: dataSource.columns.map((v) => ({
            title: v,
            field: v,
          })),
        },
        data: dataSource,
      }}
      options={{}}
    />
  );
}
