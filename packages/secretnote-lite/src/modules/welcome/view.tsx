import { BaseView, singleton, view } from '@difizen/mana-app';
import React from 'react';
import './index.less';

export const WelcomeComponent = () => {
  return <div className="secretnote-welcome-page">Welcome to SecretNote.</div>;
};

@singleton()
@view('secretnote-welcome-view')
export class WelcomeView extends BaseView {
  view = WelcomeComponent;
}
