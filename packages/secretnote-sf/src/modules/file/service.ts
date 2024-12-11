import { ContentsManager, type IContentsModel } from '@difizen/libro-jupyter';
import { inject, prop, singleton } from '@difizen/mana-app';
import type { TreeDataNode as DataNode } from 'antd';

import {
  copyToClipboard,
  downloadFileByURL,
  genericErrorHandler,
  getRemoteBaseUrl,
  readFile,
  requestNoUnpack,
} from '@/utils';

import { SecretNoteServerManager, ServerStatus } from '../server';

export const CHUNK_SIZE = 1024 * 1024; // 1MB
export const BASE_PATH = '/';
@singleton()
export class FileService {
  protected readonly contentsManager: ContentsManager;
  protected readonly serverManager: SecretNoteServerManager;

  @prop() fileTree: DataNode[] = [];

  constructor(
    @inject(ContentsManager) contentsManager: ContentsManager,
    @inject(SecretNoteServerManager) serverManager: SecretNoteServerManager,
  ) {
    this.contentsManager = contentsManager;
    this.serverManager = serverManager;
    this.serverManager.onServerAdded(this.onServerChanged.bind(this));
    this.serverManager.onServerDeleted(this.onServerChanged.bind(this));
    this.serverManager.onServerStarted(this.onServerChanged.bind(this));
    this.serverManager.onServerStopped(this.onServerChanged.bind(this));
  }

  async getFileTree() {
    const maybeServerList = await this.serverManager.getServerList();
    if (!maybeServerList) {
      genericErrorHandler('Failed to get server list');
      return;
    }

    const servers = maybeServerList.filter((s) => s.status === ServerStatus.Succeeded);
    const fileTree: DataNode[] = [];

    for (const server of servers) {
      const serverNode: DataNode = {
        title: server.name,
        key: server.id,
        children: [],
      };

      try {
        const list = await this.contentsManager.get(BASE_PATH, {
          baseUrl: getRemoteBaseUrl(server.id),
          content: true,
        });

        const fileList = list.content.filter((file: any) =>
          this.isFileVisible(file.path),
        );
        const fileNodeList = fileList.map((file: any) => {
          return {
            title: file.name,
            key: this.formatNodeKey(server.id, file.path),
            isLeaf: true,
          };
        });
        const sortedFileNodeList = fileNodeList.sort((a: any, b: any) => {
          return a.title.localeCompare(b.title);
        });
        serverNode.children = sortedFileNodeList;
        fileTree.push(serverNode);
      } catch (err) {
        genericErrorHandler(err);
      }
    }

    this.fileTree = fileTree;

    return fileTree;
  }

  async isFileExist(nodeData: DataNode, name: string): Promise<boolean> {
    const serverId = nodeData.key as string;
    const server = await this.serverManager.getServerDetail(serverId);
    if (!server) {
      return false;
    }
    const list = await this.contentsManager.get(BASE_PATH, {
      baseUrl: getRemoteBaseUrl(server.id),
      content: true,
    });

    return list.content.some((file: any) => file.name === name);
  }

  /**
   * Upload file via Jupyter Server. All files are treated as binary, uploaded with base64 format,
   * and chunked if possible.
   *
   * @see https://github.com/jupyterlab/jupyterlab/blob/main/packages/filebrowser/src/model.ts
   */
  async uploadFile(nodeData: DataNode, name: string, file: File) {
    const serverId = nodeData.key as string;
    const server = await this.serverManager.getServerDetail(serverId);
    if (server) {
      const baseUrl = getRemoteBaseUrl(server.id),
        path = `${BASE_PATH}/${name}`,
        baseOptions = {
          baseUrl,
          name,
          path,
          type: 'file',
          format: 'base64',
          mimetype: 'application/octet-stream',
        } as const;

      if (file.size < CHUNK_SIZE) {
        // no need to chunk, just upload the whole file
        return await this.contentsManager.save(path, {
          content: await readFile(file, 'base64'),
          ...baseOptions,
        });
      } else {
        // perform chunked uploading
        const _upload = async (blob: Blob, chunk: number) =>
          await this.contentsManager.save(path, {
            content: await readFile(blob, 'base64'),
            chunk,
            ...baseOptions,
          });
        let finalModal: IContentsModel | undefined = void 0,
          currentModel: IContentsModel;
        for (let start = 0; !finalModal; start += CHUNK_SIZE) {
          const end = start + CHUNK_SIZE,
            isLastChunk = end >= file.size,
            chunk = isLastChunk ? -1 : end / CHUNK_SIZE;
          currentModel = await _upload(file.slice(start, end), chunk);
          isLastChunk && (finalModal = currentModel);
        }
        return finalModal;
      }
    }
  }

  /**
   * Download data file in computation node.
   */
  async downloadFile(nodeData: DataNode) {
    const { serverId, path } = this.parseNodeKey(nodeData.key as string);
    const server = await this.serverManager.getServerDetail(serverId);
    if (server) {
      const baseUrl = getRemoteBaseUrl(server.id);
      const downloadURL = await this.contentsManager.getDownloadUrl(path, {
        baseUrl,
      });
      // to make it consistent with other API, we manually remove the baseUrl from the result
      const resp = await requestNoUnpack(
        downloadURL.replace(new RegExp(`^${baseUrl}/?`), ''),
        {
          method: 'GET',
        },
        server.id,
      );
      if (resp.status === 200) {
        downloadFileByURL(
          window.URL.createObjectURL(await resp.blob()),
          nodeData.title as string,
        );
      }
    }
  }

  async deleteFile(nodeData: DataNode) {
    if (!nodeData.isLeaf) {
      return;
    }
    const { serverId, path } = this.parseNodeKey(nodeData.key as string);
    const server = await this.serverManager.getServerDetail(serverId);
    if (server) {
      await this.contentsManager.delete(path, {
        baseUrl: getRemoteBaseUrl(server.id),
      });
      await this.getFileTree();
    }
  }

  async getFileContent(serverId: string, path: string) {
    const decodedPath = decodeURIComponent(path);
    const server = await this.serverManager.getServerDetail(serverId);
    if (server) {
      const data = await this.contentsManager.get(decodedPath, {
        baseUrl: getRemoteBaseUrl(server.id),
        content: true,
      });
      return data;
    }
  }

  viewFile(nodeData: DataNode) {
    const { serverId, path } = this.parseNodeKey(nodeData.key as string);
    const encodedPath = encodeURIComponent(path);
    // TODO
    window.open(
      `/secretnote/preview?serverId=${serverId}&path=${encodedPath}`,
      '_blank',
    );
  }

  async copyPath(nodeData: DataNode) {
    const { path } = this.parseNodeKey(nodeData.key as string);
    return await copyToClipboard(`/home/secretnote/workspace/${path}`);
  }

  getFileExt(nodeData: DataNode) {
    const { path } = this.parseNodeKey(nodeData.key as string);
    return this.getFileExtByPath(path);
  }

  getFileExtByPath(path: string) {
    return path.split('.').pop();
  }

  private formatNodeKey(serverId: string, path: string) {
    return `${serverId}|${path}`;
  }

  private parseNodeKey(dataKey: string) {
    const [serverId, path] = dataKey.split('|');
    return { serverId, path };
  }

  private isFileVisible(path: string) {
    return true; // let all files be visible
  }

  private onServerChanged() {
    this.getFileTree();
  }
}
