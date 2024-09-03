import SecretNoteLite from '@alipay/secretnote-lite';
import './index.less';

export default function () {
  return (
    <div className="secretnote-sf-container">
      <SecretNoteLite backendURL="/" />
    </div>
  );
}
