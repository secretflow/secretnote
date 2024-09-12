// import SecretNoteSF from '@alipay/secretnote-sf';
import SecretNoteSF from '../../../secretnote-sf';
import './index.less';

export default function () {
  return (
    <div className="secretnote-sf-container">
      <SecretNoteSF backendURL="/" />
    </div>
  );
}