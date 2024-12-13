// import { SCQLWorkspace } from '@alipay/secretnote-scql';
import { SCQLWorkspace } from '../../../../secretnote-scql'; // use local version during dev

import './index.less';

export default function () {
  return (
    <div className="secretnote-scql-container">
      <SCQLWorkspace />
    </div>
  );
}
