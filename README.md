<h1 align="center">
SecretNote
</h1>

SecretNote 是为 SecretFlow (隐语) 学习者和开发者定制的高级工具套件，可帮助您快速开展隐语实验。它包括 SecretNote SF 和 SecretNote SCQL，均以 Notebook 的形式呈现。前者用于 Python 环境下的 [SecretFlow](https://www.secretflow.org.cn/zh-CN/docs/secretflow) 运行，支持多节点同时的代码执行和各节点的文件管理；后者用于进行 [SCQL](https://www.secretflow.org.cn/zh-CN/docs/scql) 相关实验。

_需要注意的是，SecretNote 的设计是为了学习和原型实验，请不要在生产环境中直接使用。_

## 使用

### 隐语实训平台云 SecretNote (推荐)

🕹 SecretNote SF 现在隐语实训平台提供云上版本，开箱即用，无需环境配置直接拉起计算节点，欢迎 [立即体验](https://www.secret-flow.com/secretnote)。

### 在本地启动 SecretNote SF

- 安装 SecretNote 包

  ```sh
  pip install secretnote
  ```

- 使用 Docker 模拟 SecretFlow 多方运算节点

  ```sh
  cd docker/secretnote-sf-sim
  docker compose up -d
  ```

  其中 [secretflow/secretnote](https://hub.docker.com/r/secretflow/secretnote) 镜像的主版本与 SecretFlow 是对应的。默认将在 8090 和 8092 端口拉起两方计算节点。

- 启动 SecretNote，在右上角添加节点 `127.0.0.1:8090` 和 `127.0.0.1:8092`，即可开始实验

  ```sh
  cd <your_work_dir>
  secretnote sf .
  ```

- 查看 [完整示例](docs/SECRETFLOW-INTRO.md)

### 在本地启动 SecretNote SCQL

SecretNote SCQL 对 P2P SCQL 进行产品化封装，降低了开发者编写 SCQL Query 以及配置 CCL 的难度。

- 安装 SecretNote 包

  ```sh
  pip install secretnote
  ```

- 使用 [P2P 方式](https://www.secretflow.org.cn/zh-CN/docs/scql/main/topics/deployment/how-to-deploy-p2p-cluster) 部署 SCQL 环境

  参考 [scql/examples/p2p-tutorial](https://github.com/secretflow/scql/tree/main/examples/p2p-tutorial)，下载该文件夹下代码，执行

  ```sh
  bash setup.sh
  docker compose up -d
  ```

- 分别作为 Alice 方和 Bob 方启动 SecretNote，即可开始实验

  ```sh
  secretnote scql --party=alice --host=http://127.0.0.1:8991 # as Alice
  secretnote scql --party=bob --host=http://127.0.0.1:8991 # as Bob
  ```

- 查看 [完整示例](docs/SCQL-INTRO.md)

## 开发与贡献

SecretNote 前端基于 [Mana](https://github.com/difizen/mana) 模块化框架和 [Libro](https://github.com/difizen/libro) Notebook 解决方案定制开发，开源的后端服务基于 [Jupyter Server](https://github.com/jupyter-server/jupyter_server) 定制开发。如需进一步了解项目结构和 API 约定，请查看 [CONTRIBUTING](CONTRIBUTING.md) 。

## 问题反馈

请在 [issues](https://github.com/secretflow/secretnote/issues) 区反馈，或点击 [隐语实训平台](https://www.secret-flow.com/welcome) 右上角 “反馈” 按钮加群咨询。
