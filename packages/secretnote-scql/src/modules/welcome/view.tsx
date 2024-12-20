// This is the welcome page consists of tutorial steps.

import {
  BaseView,
  prop,
  singleton,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import { Button, Steps } from 'antd';

import { mdToHTMLSegments } from '@/utils';

import './index.less';
import WelcomeMarkdown from './welcome.md';

export const WelcomeComponent = () => {
  const instance = useInject<WelcomeView>(ViewInstance);

  // Parse markdown content.
  const _markdowns = mdToHTMLSegments(WelcomeMarkdown as unknown as string);
  const titleMarkdown = _markdowns[0];
  const contentMarkdowns = _markdowns.slice(1);

  return (
    <div className="secretnote-welcome-page">
      <div
        dangerouslySetInnerHTML={{
          __html: titleMarkdown,
        }}
      ></div>
      <Steps
        direction="vertical"
        size="small"
        current={instance.currentStep}
        status="process"
        items={contentMarkdowns.map((__html, idx) => {
          return {
            description: (
              <div key={idx} className="step">
                <div dangerouslySetInnerHTML={{ __html }} />
                {idx === instance.currentStep && (
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => instance.nextStep()}
                  >
                    完成
                  </Button>
                )}
              </div>
            ),
          };
        })}
      />
    </div>
  );
};

@singleton()
@view('secretnote-welcome-view')
export class WelcomeView extends BaseView {
  view = WelcomeComponent;

  @prop() currentStep = 0;
  @prop() finished = false;

  constructor() {
    super();
  }

  /**
   * Go to the next step.
   */
  nextStep() {
    this.currentStep += 1;
  }
}
