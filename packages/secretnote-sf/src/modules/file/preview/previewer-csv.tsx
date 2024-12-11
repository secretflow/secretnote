// Customized CSV previewer using @antv/s2-react.
// TODO

import { SheetComponent } from '@antv/s2-react';
import '@antv/s2-react/dist/s2-react.min.css';

import { parseCSV } from '@/utils';

export default function CSVPreviewer(props: { data: string }) {
  const dataSource = parseCSV(props.data || '');

  const columns = dataSource?.length ? Object.keys(dataSource[0]) : [];
  console.log('datasource', dataSource);
  console.log('columns', columns);
  return (
    <SheetComponent
      dataCfg={{
        fields: {
          columns: columns.map((v) => ({
            title: v,
            field: v,
          })),
        },
        data: dataSource,
      }}
      options={{
        width: 800,
        height: 600,
      }}
    />
  );
}
