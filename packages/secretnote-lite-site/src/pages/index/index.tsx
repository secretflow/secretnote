import React from 'react';
import SecretNoteLite from '@alipay/secretnote-lite';
import './index.less';

export default function () {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <SecretNoteLite backendURL="/" />
    </div>
  );
}
