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

interface DescriptionProps {
  finished?: boolean;
  done: (step: number) => void;
}

const PrepareNodeDes = (props: DescriptionProps) => {
  return (
    <div className="step">
      <div className="text">最简单的方式就是使用 docker image 启动两个计算节点。</div>
      <ShViewer code={['docker run -it secretflow/secretnote']} />
      <div className="text">
        启动成功后，我们可以打开地址
        <a
          className="link"
          href="http://127.0.0.1:8090"
          target="_blank"
          rel="noreferrer"
        >
          127.0.0.1:8090
        </a>
        访问 secretnote
        页面并在右上角节点管理区域将两个节点添加进来。(两个节点地址默认为 127.0.0.1:8090
        和 127.0.0.1:8092)。
      </div>
      <img src={addNodeImgUrl} alt="add node" style={{ margin: 0 }} />
      {!props.finished && (
        <Button type="link" onClick={() => props.done(0)}>
          完成
        </Button>
      )}
    </div>
  );
};

const PrepareDatasetDes = (props: DescriptionProps) => {
  return (
    <div className="step">
      <div className="text">
        我们需要一个数据集来构建垂直分区的场景。可以点击下面的两个链接下载数据集。
      </div>
      <div className="links">
        <a className="link" href={aliceCsv} download="iris_alice.csv">
          iris_alice.csv
        </a>
        <a className="link" href={bobCsv} download="iris_bob.csv">
          iris_bob.csv
        </a>
      </div>
      <div className="text">下载后分别上传到两个节点上。</div>
      <img src={uploadFileImgUrl} alt="upload file" />
      {!props.finished && (
        <Button type="link" onClick={() => props.done(1)}>
          完成
        </Button>
      )}
    </div>
  );
};

const RunningNotebookDes = (props: DescriptionProps) => {
  return (
    <div className="step">
      <div className="text">
        我们继续点击下面的链接下载一份示例代码，然后导入到 Notebook 列表中。
      </div>
      <div className="links">
        <a className="link" href={psiSample} download="psi.ipynb">
          psi.ipynb
        </a>
      </div>
      <div className="text">
        Notebook 的操作方式和 Jupyter Notebook
        一致，并且在此基础上做了许多针对性的功能优化，比如 Python
        单元格可以选择多个节点同时去执行，然后将执行结果汇总起来输出。这给隐语多控制器执行的开发模式带来了较大的便利。
      </div>
      <img src={pythonCellImgUrl} alt="python cell" style={{ width: 660 }} />
      {!props.finished && (
        <Button type="link" onClick={() => props.done(2)}>
          完成
        </Button>
      )}
    </div>
  );
};

const CheckResultDes = (props: DescriptionProps) => {
  return (
    <div className="step">
      <div className="text">
        完成执行后，刷新文件列表，会看到新生成的隐私求交结果文件，右键打开文件详情就可以校验结果。
      </div>
      <img src={viewFileImgUrl} alt="view file" />
      {!props.finished && (
        <Button type="link" onClick={() => props.done(3)}>
          完成
        </Button>
      )}
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
          <div className="title">欢迎使用 SecretNote</div>
          <div className="subtitle">
            SecretNote 是专为隐语开发者打造的高级工具套件，以 Notebook
            的形式呈现，支持多节点代码执行和文件管理，提供运行状态追踪能力，并且支持组件快捷研发，能极大地提升开发者的效率和工作体验。
          </div>
          <div className="subtitle">
            下面是一个在两方节点上执行
            <a
              href="https://www.secretflow.org.cn/docs/secretflow/latest/zh-Hans/tutorial/PSI_On_SPU"
              target="_blank"
              rel="noreferrer"
            >
              &nbsp;SPU 隐私求交&nbsp;
            </a>
            的示例，请跟随示例一步步熟悉 secretnote 吧！
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
              title: <div className="step-title">准备环境</div>,
              description: (
                <PrepareNodeDes finished={instance.currentStep > 0} done={done} />
              ),
            },
            {
              title: <div className="step-title">准备数据</div>,
              description: (
                <PrepareDatasetDes finished={instance.currentStep > 1} done={done} />
              ),
            },
            {
              title: <div className="step-title">运行 Notebook</div>,
              description: (
                <RunningNotebookDes finished={instance.currentStep > 2} done={done} />
              ),
            },
            {
              title: <div className="step-title">验证结果</div>,
              description: (
                <CheckResultDes finished={instance.currentStep > 3} done={done} />
              ),
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
  protected storageService: StorageService;

  @prop()
  currentStep = 0;

  @prop()
  finished = false;

  constructor(@inject(StorageService) storageService: StorageService) {
    super();
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
