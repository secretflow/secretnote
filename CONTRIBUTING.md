# 贡献指南

## 项目结构

```sh
- docker # Docker 相关
  - secretflow-secretnote # secretflow/secretnote 镜像制作
  - secretnote-scql-sim # SCQL 模拟环境搭建
  - secretnote-sf-sim # SecretFlow 模拟环境搭建
- docs # 文档
- examples # 示例
  - psi # SecretFlow 隐私求交示例
  - telemetry # 可观测示例 [暂不维护]
- packages # 前端 Monorepo
  - secretnote-scql # SecretNote SCQL 主组件
  - secretnote-scql-site # SecretNote SCQL Playground (Demo Site)
  - secretnote-sf # SecretNote SF 主组件
  - secretnote-sf-site # SecretNote SF Playground (Demo Site)
  - secretnote-ui # 可观测前端支持 [暂不维护]
- pyprojects # 后端 Monorepo
  - secretnote-scql # SecretNote SCQL 后端服务
  - secretnote-sf # SecretNote SF 后端服务
  - telemetry # 可观测后端服务 [暂不维护]
```

## 后端 API 列表

为了让 SecretNote SF 能够完整地正常工作，其后端需要实现以下 API。

### 节点无关类

#### GET /secretnote/api/kernelspecs

在未添加节点时获取默认的 Kernelspecs。可返回固定内容：

```json
{
  "default": "python3",
  "kernelspecs": {
    "python3": {
      "name": "python3",
      "spec": {
        "argv": ["python", "-m", "ipykernel_launcher", "-f", "{connection_file}"],
        "env": {},
        "display_name": "Python 3 (ipykernel)",
        "language": "python",
        "interrupt_mode": "signal",
        "metadata": { "debugger": true }
      },
      "resources": {
        "logo-32x32": "/kernelspecs/python3/logo-32x32.png",
        "logo-svg": "/kernelspecs/python3/logo-svg.svg",
        "logo-64x64": "/kernelspecs/python3/logo-64x64.png"
      }
    }
  }
}
```

#### GET /secretnote/api/kernels

在未添加节点时获取默认的 Kernels。可返回 200、空 JSON body。

#### GET /secretnote/libro/api/workspace

在未添加节点时获取默认的 workspace 相关信息。可返回 200、空 JSON body。

#### GET /secretnote/lsp/status

在未添加节点时获取默认的 LSP 状态。可返回 200、空 JSON body。

### 节点管理类

可参考 `packages/secretnote-sf/src/modules/server/server-manager.ts`，请求-响应均使用 JSON Content-Type。如有鉴权需要，需自行实现（基于 Authorization 头或 Cookies）。

#### 类型定义

```ts
type SecretNoteNode = {
  id: string; // 节点 ID，不能为纯数字
  name: string; // 节点名
  status: ServerStatus; // Pending, Running, Succeeded, Failed, Unknown, Terminated
  service: string; // 该节点的 K8s Service 名
  podIp: string; // 该节点的 K8s Pod IP
};
```

#### POST /secretnote/api/nodes

为当前用户添加并启动一个节点，请求体为节点名 `{name: string, podIp?: string}`，返回对应的 `SecretNoteNode`。启动后，应保证 `GET /secretnote/:nodeid/kernelspecs` 和 `GET /secretnote/api/nodes/:nodeid` 畅通。

#### DELETE /secretnote/api/nodes/:nodeid

根据 ID 删除属于当前用户的某个节点，并清理 Jupyter Server 种下的名为 `username-<Hostname>` 的 Cookie。

#### PATCH /secretnote/api/nodes/start/:nodeid

根据 ID 启动属于当前用户的某个节点，返回对应节点的 `SecretNoteNode`。

#### PATCH /secretnote/api/nodes/stop/:nodeid

根据 ID 停止属于当前用户的某个节点，返回对应节点的 `SecretNoteNode`，其中 `podIp` 为空字符串，`status` 为 `Terminated`。

#### GET /secretnote/api/nodes/:nodeid

根据 ID 获取属于当前用户的某个节点的信息，返回对应节点的 `SecretNoteNode`。

#### GET /secretnote/api/nodes

获取属于当前用户的所有节点。返回 `SecretNoteNode[]`。

#### GET /secretnote/api/resources-versions

返回节点的资源和内部组件的版本信息。类型为

```ts
Partial<{
  cpu: number; // CPU 核心数
  memory: string; // 内存大小描述
  image: string; // Docker 镜像名
  python: string; // Python 版本
  secretflow: string; // SecretFlow 版本
}>;
```

### Notebook 文件管理类

Notebook 文件管理与节点无关，文件储存的位置取决于具体实现。请求可参考 `packages/secretnote-sf/src/modules/notebook/drive.ts`。具体协议请参考 Jupyter Server [developers/contents.html](https://jupyter-server.readthedocs.io/en/latest/developers/contents.html) ，后文仅做简单说明。请求-响应均使用 JSON Content-Type。

#### 类型定义

```ts
type ContentsModel = {
  name: string; // 文件名
  path: string; // 文件路径
  type: 'notebook'; // 文件类型，目前仅支持 "notebook"
  writable: boolean; // 是否有写权限
  created: string; // 文件创建时间时间戳，可置为空字符串
  last_modified: string; // 最后修改时间时间戳
  mimetype: 'application/json'; // MimeType，固定为此
  content: JSONObject | ContentsModel[] | null; // 文件或目录内容，目录叶子content为null
  format: 'json'; // 文件格式，固定为此
};
```

#### GET /secretnote/api/contents

获取该用户目录下的所有 Notebook 文件。SecretNote 不考虑嵌套目录情况，所有 Notebook 文件均在同一层级。必须搭配 query `?type=directory` 请求。返回 `ContentsModel`，其 `content` 为 `ContentsModel[]`。

#### GET /secretnote/api/contents/:path

根据 path 获取（打开）该用户的某个 Notebook 文件，返回 `ContentsModel`，其 `content` 为 `JSONObject`。

#### POST /secretnote/api/contents

在该用户目录下新建 `Untitled.ipynb` 文件。当该文件存在时，在文件名后追加编号。返回 `ContentsModel`。

#### POST /secretnote/api/contents/:path

SecretNote 不考虑嵌套目录情况，因此 path 必须为空字符串。当请求体存在 `copy_from` 参数时，将 `copy_from` 指定的文件复制到 path 下。当该文件存在时，在文件名后追加编号。返回 `ContentsModel`。

#### PATCH /secretnote/api/contents/:path

重命名该用户目录下，路径参数 path 指定的文件为请求体参数 path 指定的文件。返回 `ContentsModel`。

#### PUT /secretnote/api/contents/:path

请求体形如 `ContentsModel`，至少包含 `content` 属性。

- 新建文件：`content` 为空字符串或 null 时，在 path 处新建文件，响应码 HTTP 201。
- 上传文件：`content` 为 JSONObject 且 path 处文件不存在时，上传文件，响应码 HTTP 201。
- 保存文件：`content` 为 JSONObject 且 path 处文件存在时，保存更新文件，响应码 HTTP 200。

最终返回新的文件的 `ContentsModel`。

#### DELETE /secretnote/api/contents/:path

删除该用户目录下 path 指定的文件。返回 204 状态码和 NoContent 响应，响应头 Location 为 path。

#### GET /secretnote/files/:path

提示浏览器下载该用户目录下 path 处的文件。需要配置对应的 Content-Disposition 响应头：`attachment;filename=...`。

### 节点相关类

#### GET /secretnote/:nodeid/api/workspace

在添加节点后获取 workspace 相关信息。因 SecretNote 不使用 workspace 概念，可返回 200、空 JSON body。

#### ANY /secretnote/:nodeid/\*

全部转发到 nodeid 确定的节点的 Jupyter Server 中。Rewrite 规则为 `/secretnote/:nodeid/* → /*`。其中，节点的 Contents API 会处理实验数据类文件的管理。
