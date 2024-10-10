import type { BaseOutputView } from '@difizen/libro-jupyter';
import { l10n } from '@difizen/mana-l10n';

import './index.less';

export const SQLOutputRender: React.FC<{ model: BaseOutputView }> = (props: {
  model: BaseOutputView;
}) => {
  const { model } = props;
  const data = model.data['application/vnd.libro.sql+json'] as {
    columns: string[];
    rows: string[][];
  };

  if (!data) {
    return null;
  }

  return (
    <div className="sql-output-render libro-html-common-render">
      <table border={1} className="dataframe">
        <thead>
          <tr style={{ textAlign: 'right' }}>
            <th></th>
            {data.columns.map((item: string) => (
              <th key={item}>{item}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((item: string[], index: number) => (
            <tr key={index}>
              <td>{index}</td>
              {item.map((val: string) => (
                <td key={val}>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        {data.rows.length} {l10n.t('行')} × {data.columns.length} {l10n.t('列')}
      </p>
    </div>
  );
};
