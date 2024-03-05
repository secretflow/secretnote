## 介绍

SecretNote 是专为隐语开发者打造的高级工具套件。以 notebook 的形式呈现，支持多节点代码执行和文件管理，同时提供运行状态追踪功能，能较大程度提升开发者的效率和工作体验。

**由于系统安全等问题，SecretNote 不是为生产设计的，请不要直接在生产环境中使用。**

## 使用

### 与 SecretFlow 一起使用

SecretNote 有单独的 [pip](https://pypi.org/project/secretnote/) 安装包，可以单独使用。为了避免安装、部署、启动等环境问题，推荐使用 docker 方式启动 SecretFlow 运行环境。

1. 启动两个容器，推荐使用 docker compose，这样方便管理容器之间的通信。

```yml
services:
  alice:
    image: 'secretflow/secretnote:unstable-amd64'
    platform: linux/amd64
    environment:
      - SELF_PARTY=alice
      - ALL_PARTIES=alice,bob
    ports:
      - 8090:8888
    entrypoint: /root/scripts/start.sh
    volumes:
      - /root/scripts

  bob:
    image: 'secretflow/secretnote:unstable-amd64'
    platform: linux/amd64
    environment:
      - SELF_PARTY=bob
      - ALL_PARTIES=alice,bob
    ports:
      - 8092:8888
    entrypoint: /root/scripts/start.sh
    volumes:
      - /root/scripts
```

```bash
docker compose up
```

2. 在浏览器中打开 `http://localhost:8090` 或者 `http://localhost:8092` 访问 Web Client 进行 SecretFlow 代码研发。详细步骤可以参考[文档](./docs/guide/secretnote-sf.md)。

### 与 SCQL 一起使用

SecretNote 通过对 P2P SCQL 进行产品化封装，可以通过 Web Client 降低开发者编写 SCQL Query 以及配置 CCL 的难度。

1. 分别在两台机器上部署 SCQL 环境，参考 [P2P 模式部署](https://www.secretflow.org.cn/docs/scql/0.5.0b2/zh-Hans/topics/deployment/how-to-deploy-p2p-cluster)。

2. 分别在两台机器上安装 SecretNote，并启动服务。

```bash
pip install -U secretnote

# party 为 scql broker 服务的 party_code
# host 为 scql broker 服务的地址
secretnote -mode=scql --party=alice --host=http://127.0.0.1:8991
```

3. 分别打开两台机器的启动的 Web Client，然后在 Web Client 上完成整个 SCQL 研发流程。详细步骤可以参考[文档](./docs/guide/secretnote-scql.md)。
