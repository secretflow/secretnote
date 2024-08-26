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

import { useConfetti } from '@/components/confetti';

import './index.less';

interface DescriptionProps {
  finished?: boolean;
  done: (step: number) => void;
}

const PrepareNodeDes = (props: DescriptionProps) => {
  return (
    <div className="step">
      <div className="text">
        在页面右上角点击添加节点，输入节点名称即可添加一个计算节点。
      </div>
      <img
        src="https://mdn.alipayobjects.com/huamei_usjdcg/afts/img/A*eW10TZkpAbgAAAAAAAAAAAAADo6HAQ/fmt.webp"
        alt="add node"
        style={{ width: 450, margin: 0 }}
      />
      <ul className="list">
        <li>节点名称也就是节点标识，后续会在初始化代码中使用。</li>
        <li>添加过程大概需要 30s，请耐心等待。</li>
        <li>
          添加成功后，在节点详情中可以看到节点 IP，这个 IP
          作为节点之间的通信地址。
        </li>
      </ul>
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
        <a
          className="link"
          href="https://github.com/secretflow/secretnote/blob/main/docs/guide/data/iris_alice.csv"
          target="_blank"
          rel="noreferrer"
        >
          iris_alice.csv
        </a>
        <a
          className="link"
          href="https://github.com/secretflow/secretnote/blob/main/docs/guide/data/iris_bob.csv"
          target="_blank"
          rel="noreferrer"
        >
          iris_bob.csv
        </a>
      </div>
      <div className="text">下载后分别上传到两个节点上。</div>
      <img
        src="https://mdn.alipayobjects.com/huamei_usjdcg/afts/img/A*GR6hSori6ekAAAAAAAAAAAAADo6HAQ/fmt.webp"
        alt="upload file"
      />
      <ul className="list">
        <li>最大上传文件大小限制为 32M。</li>
        <li>只支持上传 csv、txt 格式文件。</li>
      </ul>
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
        <a
          className="link"
          href="https://github.com/secretflow/secretnote/blob/main/docs/guide/data/psi.ipynb"
          target="_blank"
          rel="noreferrer"
        >
          psi.ipynb
        </a>
      </div>
      <div className="text">
        Notebook 的操作方式和 Jupyter Notebook
        一致，并且在此基础上做了许多针对性的功能优化，比如 Python
        单元格可以选择多个节点同时去执行，然后将执行结果汇总起来输出。这给隐语多控制器执行的开发模式带来了较大的便利。
      </div>
      <img
        src="https://mdn.alipayobjects.com/huamei_usjdcg/afts/img/A*dJVKTbT0KwAAAAAAAAAAAAAADo6HAQ/fmt.webp"
        alt="python cell"
        style={{ width: 660 }}
      />
      <ul className="list">
        <li>
          需要将示例代码中的 address 替换成对应节点的 IP，端口号不需要修改。
        </li>
        <li>
          如果需要安装额外的 pip 包，请使用阿里云镜像 pip install --index
          https://mirrors.aliyun.com/pypi/simple/ package_name
        </li>
      </ul>
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
        完成执行后，刷新文件列表，会看到新生成的隐私求交结果文件。
      </div>
      <img
        src="https://mdn.alipayobjects.com/huamei_usjdcg/afts/img/A*0LTDTYc9Tl4AAAAAAAAAAAAADo6HAQ/fmt.webp"
        alt="view file"
      />
      <ul className="list">
        <li>
          由于资源有限，每个人默认会有 10h 体验时间，
          添加两个节点时间会累加，所以推荐使用单个节点仿真模式进行开发，验证的时候使用两个节点。
        </li>
        <li>
          请在离开页面之前停止或者删除计算节点，否则会持续计时，造成计算资源浪费。如果时间到期，请联系管理员进行升级。
        </li>
      </ul>
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

  const done = (step: number) => {
    instance.setCurrentStep(step + 1);
  };

  return (
    <div className="secretnote-welcome-page">
      <div className="process">
        <div className="header">
          <div className="title">欢迎使用在线实验环境。</div>
          <div className="subtitle">
            下面是一个在两方节点上执行
            <a
              href="https://www.secretflow.org.cn/docs/secretflow/latest/zh-Hans/tutorial/PSI_On_SPU"
              target="_blank"
              rel="noreferrer"
            >
              &nbsp;SPU 隐私求交&nbsp;
            </a>
            的示例，请跟随示例一步步熟悉基本操作吧！
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
              title: <div className="step-title">准备节点</div>,
              description: (
                <PrepareNodeDes
                  finished={instance.currentStep > 0}
                  done={done}
                />
              ),
            },
            {
              title: <div className="step-title">准备数据</div>,
              description: (
                <PrepareDatasetDes
                  finished={instance.currentStep > 1}
                  done={done}
                />
              ),
            },
            {
              title: <div className="step-title">运行 Notebook</div>,
              description: (
                <RunningNotebookDes
                  finished={instance.currentStep > 2}
                  done={done}
                />
              ),
            },
            {
              title: <div className="step-title">验证结果</div>,
              description: (
                <CheckResultDes
                  finished={instance.currentStep > 3}
                  done={done}
                />
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
