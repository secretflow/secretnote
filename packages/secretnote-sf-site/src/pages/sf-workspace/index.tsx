// import { SFWorkspace } from '@alipay/secretnote-sf';
import { SFWorkspace } from '../../../../secretnote-sf/dist'; // use local version during dev
import './index.less';

export default function App() {
  return (
    <div className="secretnote-sf-workspace-container">
      <SFWorkspace backendURL="/" selfDeploy />
    </div>
  );
}
