import { TableSheet } from '@antv/s2';
import { singleton } from '@difizen/mana-app';
import { useEffect, useRef } from 'react';

import { parseCSV } from '@/utils';

import { FilePreviewContribution } from './protocol';

const TableView = (props: { data: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const s2 = useRef<TableSheet>();

  useEffect(() => {
    if (props.data && ref.current) {
      const dataSource = parseCSV(props.data || '');
      let columns: string[] = [];
      if (dataSource.length > 0) {
        columns = Object.keys(dataSource[0]);
      }

      const width = ref.current.offsetWidth;
      const height = ref.current.offsetHeight;
      const s2Options = {
        width,
        height,
        showSeriesNumber: true,
      };
      const s2DataConfig = {
        fields: {
          columns,
        },
        data: dataSource,
      };

      s2.current = new TableSheet(ref.current, s2DataConfig, s2Options);
      s2.current.render();
    }

    return () => {
      if (s2.current) {
        s2.current.destroy();
      }
    };
  }, [props.data]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

@singleton({ contrib: [FilePreviewContribution] })
export class CsvPreview implements FilePreviewContribution {
  type = 'csv';
  render = (data: string) => {
    return <TableView data={data} />;
  };
}
