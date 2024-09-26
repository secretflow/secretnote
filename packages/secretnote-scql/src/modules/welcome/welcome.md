# 欢迎使用 SecretNote SCQL 在线实验环境

下面是一个在两方节点上执行 [SPU 隐私求交](https://www.secretflow.org.cn/docs/secretflow/latest/zh-Hans/tutorial/PSI_On_SPU) 的示例。请跟随示例一步步熟悉基本操作吧！

---

## 准备节点

在页面右上角点击添加节点，输入节点名称即可添加一个计算节点。

![add_node](https://mdn.alipayobjects.com/huamei_usjdcg/afts/img/A*eW10TZkpAbgAAAAAAAAAAAAADo6HAQ/fmt.webp)

- 添加过程大概需要 30s，请耐心等待。
- 节点名称后续会在初始化代码中使用。
- 添加成功后，节点详情中可看到节点 IP，作为节点之间的通信地址。

---

## 准备数据

我们需要一个数据集来构建垂直分区的场景。可以点击 [iris_alice.csv](https://github.com/secretflow/secretnote/blob/main/docs/guide/data/iris_alice.csv) 和 [iris_bob.csv](https://github.com/secretflow/secretnote/blob/main/docs/guide/data/iris_bob.csv) 下载示例数据集。下载后分别上传到两个节点上。

![upload_data](https://mdn.alipayobjects.com/huamei_usjdcg/afts/img/A*GR6hSori6ekAAAAAAAAAAAAADo6HAQ/fmt.webp)

- 只支持上传 csv 和 txt 格式的文件。
- 最大上传文件大小限制为 32M。
- 如需使用其他外部数据集，请在本地下载后上传至节点，不建议直接通过代码在节点上下载。

---

## 运行 Notebook

我们继续点击 [psi.ipynb](https://github.com/secretflow/secretnote/blob/main/docs/guide/data/psi.ipynb) 下载一份示例代码，然后导入到 Notebook 列表中。

SecretNote 的操作方式和 Jupyter Notebook 基本一致，并做了许多针对性的功能优化。比如 Python 单元格可选择多个节点同时执行，然后将执行结果汇总输出，这给隐语多控制器执行的开发模式带来了便利。

![python_cell](https://mdn.alipayobjects.com/huamei_usjdcg/afts/img/A*dJVKTbT0KwAAAAAAAAAAAAAADo6HAQ/fmt.webp)

- 需将示例代码中的 address 替换成对应节点的 IP，端口号不需要修改。
- 如需安装其他 pip 包，请执行 `!pip install -i https://mirrors.aliyun.com/pypi/simple/ <包名>` 指定阿里云源安装

---

## 验证结果

完成执行后，刷新文件列表，会看到新生成的隐私求交结果文件。

![view_result](https://mdn.alipayobjects.com/huamei_usjdcg/afts/img/A*0LTDTYc9Tl4AAAAAAAAAAAAADo6HAQ/fmt.webp)

- 因资源有限，每个人默认有 10h 体验时间。添加两个节点时间会累加，故推荐使用单节点仿真模式进行实验，而验证时使用两个节点。
- 请在离开页面前停止或删除节点，否则会持续计时，造成计算资源浪费。如果时间用尽，请联系管理员进行升级。
