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

import { useConfetti } from '@/components/confetti';
import { mdToHTMLSegments } from '@/utils';

import './index.less';
import StepsMarkdown from './steps.md';

export const WelcomeComponent = () => {
  const instance = useInject<WelcomeView>(ViewInstance);

  // Parse markdown content.
  const _markdowns = mdToHTMLSegments(StepsMarkdown as unknown as string);
  const titleMarkdown = _markdowns[0];
  const contentMarkdowns = _markdowns.slice(1);

  useConfetti({
    zIndex: 2000,
    spread: 500,
    predicate: () => {
      if (
        instance.currentStep > contentMarkdowns.length - 1 &&
        !instance.finished
      ) {
        return new Promise((resolve) =>
          setTimeout(() => resolve('confetti'), 100),
        );
      }
      return Promise.resolve(undefined);
    },
  });

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
