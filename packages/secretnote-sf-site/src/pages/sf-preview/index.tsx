// import { SFPreview } from '@alipay/secretnote-sf';
import { SFPreview } from '../../../../secretnote-sf'; // use local version during dev
import './index.less';

export default function App() {
  return (
    <div className="secretnote-sf-preview-container">
      <SFPreview blobURL={'TODO'} readonly />
    </div>
  );
}
