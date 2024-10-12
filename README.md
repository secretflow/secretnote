<h1 align="center">SecretNote</h1>

SecretNote 是为 SecretFlow (隐语) 学习者和开发者定制的高级工具套件，可帮助您快速开展隐语实验。它包括 SecretNote SF 和 SecretNote SCQL，均以 Notebook 的形式呈现。前者用于 Python 下的 [SecretFlow](https://www.secretflow.org.cn/zh-CN/docs/secretflow) 运行，支持多节点代码执行和文件管理；后者用于进行 [SCQL](https://www.secretflow.org.cn/zh-CN/docs/scql) 相关实验。

<img src="docs/images/first-view.jpg" alt="first-view" style="zoom:25%;" />

\* *SecretNote 的设计是为了学习和原型实验，请勿在生产环境中直接使用。*

## 快速开始

### 隐语实训平台云 SecretNote (推荐)

SecretNote SF 现在隐语实训平台提供云端版本，开箱即用，无需环境配置直接拉起计算节点，欢迎 [立即体验](https://www.secret-flow.com/secretnote)。

### 本地启动 SecretNote SF

- 安装 SecretNote Python 包

  ```sh
  pip install secretnote
  ```

- 根据需要拉起一定数量的计算节点

  [secretflow/secretnote](https://hub.docker.com/r/secretflow/secretnote) 提供了内置 SecretFlow 的计算节点镜像，且版本号相互对应。可根据需要自行调整监听端口、镜像版本等配置。

  - 使用 Docker 拉起一个计算节点

    ```sh
    docker run --env=SELF_PARTY=alice --env=ALL_PARTIES=alice,bob -p 8090:8888 -d secretflow/secretnote:<version>
    ```

  - 使用 Docker Compose 拉起多个计算节点

    ```sh
    cd docker/secretnote-sf-sim && docker compose up -d
    ```

- 启动 SecretNote SF，在右上角连接计算节点，即可开始实验

  ```sh
  secretnote sf <work_dir>
  ```

- 如有需要，请查看更完整的具体[示例](docs/SECRETFLOW-INTRO.md)

### 本地启动 SecretNote SCQL

SecretNote SCQL 提供了 P2P SCQL 的产品化封装，降低了开发者配置 CCL 和编写 Query 的难度。

- 安装 SecretNote Python 包

  ```sh
  pip install secretnote
  ```

- 使用 [P2P 方式](https://www.secretflow.org.cn/zh-CN/docs/scql/main/topics/deployment/how-to-deploy-p2p-cluster) 拉起 SCQL 环境，参考 [scql/examples/p2p-tutorial](https://github.com/secretflow/scql/tree/main/examples/p2p-tutorial)，下载该文件夹，执行

  ```sh
  bash setup.sh && docker compose up -d
  ```
  
  可根据需要调整 SCQL Broker 服务的端口。
  
- 分别作为 Alice 方和 Bob 方启动 SecretNote，即可开始实验

  ```sh
  secretnote scql <work_dir> --party=alice --broker=http://127.0.0.1:8991
  secretnote scql <work_dir> --party=bob --broker=http://127.0.0.1:8992
  ```

- 如有需要，请查看更完整的具体[示例](docs/SCQL-INTRO.md)

## 开发与贡献

SecretNote 的前端基于 [Mana](https://github.com/difizen/mana) 和 [Libro](https://github.com/difizen/libro) 开发，开源后端基于 [Jupyter Server](https://github.com/jupyter-server/jupyter_server) 开发。

```sh
pnpm run bootstrap && pnpm run build # 安装依赖并初次构建
```

以开发 SecretNote SF 为例，需同时启动组件编译、Playground DevServer、本地 Jupyter Server：

```sh
pnpm run dev # 在 packages/secretnote-sf 下监视组件修改
pnpm run dev # 在 packages/secretnote-sf-site 下启动 DevServer
NODE_ENV=development python -m secretnote sf <work_dir> --config=./secretnote/sf/.jupyter/config_dev.py --no-browser
# 在 pyprojects 下启动 Jupyter Server
```

请根据需要调整 Playground DevServer 的代理配置。如需 HMR 能力，请暂时从 `../../../secretnote-sf` 引入组件。进一步了解项目结构和 API 约定可查看 [CONTRIBUTING](CONTRIBUTING.md)。

## 问题反馈

请在 [issues](https://github.com/secretflow/secretnote/issues) 反馈，或点击 [隐语实训平台](https://www.secret-flow.com/welcome) 右上角 “反馈” 按钮加群咨询。
