import {
  BaseView,
  inject,
  prop,
  singleton,
  StorageService,
  useInject,
  view,
  ViewInstance,
} from '@difizen/mana-app';
import { Button, Progress, Steps } from 'antd';

import aliceCsv from '@/assets/data/iris_alice.csv';
import bobCsv from '@/assets/data/iris_bob.csv';
import addNodeImgUrl from '@/assets/image/add-node.jpg';
import pythonCellImgUrl from '@/assets/image/python-cell.jpg';
import uploadFileImgUrl from '@/assets/image/upload-file.jpg';
import viewFileImgUrl from '@/assets/image/view-result.jpg';
import psiSample from '@/assets/notebook/psi.ipynb';
import { useConfetti } from '@/components/confetti';
import { ShViewer } from '@/components/sh-viewer';

import './index.less';
import { WelcomeService } from './service';

interface DescriptionProps {
  done: (step: number) => void;
}

const PrepareNodeDes = (props: DescriptionProps) => {
  return (
    <div className="step">
      <div className="text">
        First we install secretflow and secretnote on two machines and start secretnote.
      </div>
      <ShViewer
        code={['pip install –U secretflow', 'pip install secretnote', 'secretnote']}
      />
      <div className="text">
        When the secretnote command is executed, the web page opens automatically, and
        we can add another node by clicking the plus sign in the upper right corner of
        the web page of one node.
      </div>
      <img src={addNodeImgUrl} alt="add node" style={{ margin: 0 }} />
      <Button type="link" onClick={() => props.done(0)}>
        Done
      </Button>
    </div>
  );
};

const PrepareDatasetDes = (props: DescriptionProps) => {
  return (
    <div className="step">
      <div className="text">
        Then, we need a dataset for constructing vertical partitioned scenarios. Both
        datasets can be downloaded by clicking on the two links below.
      </div>
      <div className="links">
        <a className="link" href={aliceCsv} download="iris_alice.csv">
          iris_alice.csv
        </a>
        <a className="link" href={bobCsv} download="iris_bob.csv">
          iris_bob.csv
        </a>
      </div>
      <div className="text">We can then upload the two datasets to each node.</div>
      <img src={uploadFileImgUrl} alt="upload file" />
      <Button type="link" onClick={() => props.done(1)}>
        Done
      </Button>
    </div>
  );
};

const RunningNotebookDes = (props: DescriptionProps) => {
  return (
    <div className="step">
      <div className="text">
        Let&apos;s download the following sample code and import it into the notebook
        list.
      </div>
      <div className="links">
        <a className="link" href={psiSample} download="psi.ipynb">
          psi.ipynb
        </a>
      </div>
      <div className="text">
        After importing the notebook and opening the notebook file, we can operate the
        secretnote editor in the right panel the same way we operate the jupyter
        notebook.
      </div>
      <div className="text">
        It should be noted that our python cell can select multiple nodes to execute,
        and the output of multiple parties will be summarized and displayed after
        execution. This brings great convenience to secretflow.
      </div>
      <img src={pythonCellImgUrl} alt="python cell" style={{ width: 660 }} />
      <Button type="link" onClick={() => props.done(2)}>
        Done
      </Button>
    </div>
  );
};

const CheckResultDes = (props: DescriptionProps) => {
  return (
    <div className="step">
      <div className="text">
        After executing the above example, the resulting files are generated on both
        nodes, and we can refresh the list of files to see them and view the file
        details.
      </div>
      <img src={viewFileImgUrl} alt="view file" />
      <Button type="link" onClick={() => props.done(3)}>
        Done
      </Button>
    </div>
  );
};

export const WelcomeComponent = () => {
  const instance = useInject<WelcomeView>(ViewInstance);

  const done = (step: number) => {
    instance.setCurrentStep(step + 1);
  };

  useConfetti({
    zIndex: 2000,
    spread: 500,
    predicate: () => {
      if (instance.currentStep > 3 && !instance.finished) {
        return new Promise((resolve) => {
          setTimeout(() => resolve('confetti'), 100);
        });
      }
      return Promise.resolve(undefined);
    },
  });

  return (
    <div className="secretnote-welcome-page">
      <div className="process">
        <div className="header">
          <div className="title">Welcome to SecretNote.</div>
          <div className="subtitle">
            Here&apos;s how to running a psi on spu with secretnote in four easy steps.
          </div>
        </div>
        <Progress
          className="progress"
          size="small"
          percent={Math.min(25 * instance.currentStep, 100)}
          showInfo={false}
          strokeColor="#52c41a"
        />
        <Steps
          direction="vertical"
          size="small"
          current={instance.currentStep}
          status="process"
          items={[
            {
              title: <div className="step-title">Preparing Node</div>,
              description: <PrepareNodeDes done={done} />,
            },
            {
              title: <div className="step-title">Preparing Dataset</div>,
              description: <PrepareDatasetDes done={done} />,
            },
            {
              title: <div className="step-title">Running PSI</div>,
              description: <RunningNotebookDes done={done} />,
            },
            {
              title: <div className="step-title">Check Result</div>,
              description: <CheckResultDes done={done} />,
            },
          ]}
        />
      </div>
    </div>
  );
};

@singleton()
@view('secretnote-welcome-view')
export class WelcomeView extends BaseView {
  view = WelcomeComponent;
  readonly service: WelcomeService;
  protected storageService: StorageService;

  @prop()
  currentStep = 0;

  @prop()
  finished = false;

  constructor(
    @inject(WelcomeService) service: WelcomeService,
    @inject(StorageService) storageService: StorageService,
  ) {
    super();
    this.service = service;
    this.storageService = storageService;
    this.getCurrentStep();
  }

  async getCurrentStep() {
    const step = await this.storageService.getData<number>('tutorial-step');
    this.currentStep = step || 0;
    this.finished = step === 4;
    return step;
  }

  async setCurrentStep(step: number) {
    this.currentStep = step;
    await this.storageService.setData('tutorial-step', step);
  }
}
