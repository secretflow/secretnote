下面演示在一台机器上使用 docker 启动两个容器环境来模拟不同参与方完成一次 PSI。

### 准备环境

在一台机器上（暂时不支持 Mac M1 机器）使用 docker compose 启动两个容器，容器启动时会安装 SecretFLow、SecretNote，并且分别启动 Ray 服务以及 SecretNote 服务。

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

在浏览器中（推荐使用 Chrome）通过地址 `http://127.0.0.1:8090` 打开 Web Client，并在右上角节点管理区域将两个计算节点添加进来（两个节点地址为 `127.0.0.1:8090` 和 `127.0.0.1:8092`）。

![image.png](./images/node.png)

### 准备数据

我们需要一个数据集来构建垂直分区的场景。可以点击下面的两个链接下载数据集。

[iris_alice.csv](./data/iris_alice.csv)

[iris_bob.csv](./data/iris_bob.csv)

下载后分别上传到两个节点上。

![image.png](./images/file.png)

### 运行 Notebook

我们继续点击下面的链接下载一份示例代码，然后导入到 Notebook 列表中。

[psi.ipynb](./data/psi.ipynb)

Notebook 的操作方式和 Jupyter Notebook 一致，并且在此基础上做了许多针对性的功能优化，比如 Python 单元格可以选择多个节点同时去执行，然后将执行结果汇总起来输出。这给隐语多控制器执行的开发模式带来了较大的便利。

![image.png](./images/code.png)

### 验证结果

完成执行后，刷新文件列表，会看到新生成的隐私求交结果文件，右键打开文件详情就可以校验结果。

![image.png](./images/result.png)
