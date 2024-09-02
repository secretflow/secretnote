<h1 align="center">
SecretNote
</h1>

SecretNote 是为 SecretFlow (隐语) 学习者和开发者定制的高级工具套件，可帮助您快速开展隐语实验。它包括 SecretNote SF 和 SecretNote SCQL，均以 Notebook 的形式呈现。

SecretNote SF 用于XXX，支持多节点同时的代码执行和各节点的文件管理；SecretNote SCQL 用于XXX，

*SecretNote 的设计是为了学习和原型实验，请不要在生产环境中直接使用。*

## 使用

### 隐语实训平台云 SecretNote (推荐)

SecretNote SF 现在实训平台提供云上版本，开箱即用，无需环境配置直接拉起计算节点，欢迎 [立即体验](https://www.secret-flow.com/secretnote)。

### 在本地启动 SecretNote SF

- 在本地安装 SecretNote SF

  ```sh
  pip install secretnote
  ```

- 使用 Docker 模拟 SecretFlow 多方运算节点

​	为了避免安装、部署、启动等环境问题，推荐使用 docker 方式启动 SecretFlow 运行环境。secretnote 镜像版本 secretflow 的版本是对应的，也就是说，如果你想使用 secretflow 1.6.1 版本，那就使用镜像 secretflow/secretnote:1.6.1。

```bash
docker compose up -d
```

- 启动在浏览器中打开 `http://localhost:8090` 或者 `http://localhost:8092` 访问 Web Client 进行 SecretFlow 代码研发。详细 操作步骤可以参考[文档](./docs/guide/secretnote-sf.md)。

### 在本地启动 SecretNote SCQL

SecretNote 通过对 P2P SCQL 进行产品化封装，可以通过 Web Client 降低开发者编写 SCQL Query 以及配置 CCL 的难度。

1. 分别在两台机器上部署 SCQL 环境，参考 [P2P 模式部署](https://www.secretflow.org.cn/docs/scql/0.5.0b2/zh-Hans/topics/deployment/how-to-deploy-p2p-cluster)。

2. 分别在两台机器上安装 SecretNote，并启动服务。

```bash
pip install secretnote

secretnote --mode=scql --party=alice --host=http://127.0.0.1:8991
```

3. 分别打开两台机器的启动的 Web Client，然后在 Web Client 上完成整个 SCQL 研发流程。详细操作步骤可以参考[文档](./docs/guide/secretnote-scql.md)。

## 开发与贡献

SecretNote 基于 Mana 和 Libro，基于 Jupyter Server 定制

[项目结构、API、贡献须知](docs/CONTRIBUTING.md)

## 问题反馈

