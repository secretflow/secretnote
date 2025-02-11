// import { SFPreview } from '@alipay/secretnote-sf';
import { SFPreview } from '../../../../secretnote-sf'; // use local version during dev
import './index.less';

export default function App() {
  const notebookFileURL = 'FILL_ME_WITH_YOUR_NOTEBOOK_FILE_URL';

  return (
    <div className="secretnote-sf-preview-container">
      <SFPreview fileURL={notebookFileURL} readonly />
    </div>
  );
}
