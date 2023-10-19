/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContentsManager } from '@difizen/libro-jupyter';
import { inject, prop, singleton } from '@difizen/mana-app';
import type { DataNode } from 'antd/es/tree';

import { downloadFileByUrl as download, ERROR_CODE } from '@/utils';

import { SecretNoteServerManager } from '../server';

export const BASE_PATH = '/';
export const FILE_EXTS = ['.csv', '.log', '.txt'];
@singleton()
export class FileService {
  protected readonly contentsManager: ContentsManager;
  protected readonly serverManager: SecretNoteServerManager;

  @prop()
  fileTree: DataNode[] = [];

  constructor(
    @inject(ContentsManager) contentsManager: ContentsManager,
    @inject(SecretNoteServerManager) serverManager: SecretNoteServerManager,
  ) {
    this.contentsManager = contentsManager;
    this.serverManager = serverManager;
  }

  async getFileTree() {
    const servers = this.serverManager.servers;
    const fileTree: DataNode[] = [];

    for (const server of servers) {
      const serverNode: DataNode = {
        title: server.name,
        key: server.id,
        children: [],
      };

      try {
        const list = await this.contentsManager.get(BASE_PATH, {
          baseUrl: server.settings.baseUrl,
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
        // pass
      }
    }

    this.fileTree = fileTree;

    return fileTree;
  }

  async isFileExist(nodeData: DataNode, name: string): Promise<boolean> {
    const serverId = nodeData.key as string;
    const server = this.serverManager.getServerById(serverId);
    if (!server) {
      return false;
    }
    const list = await this.contentsManager.get(BASE_PATH, {
      baseUrl: server.settings.baseUrl,
      content: true,
    });

    return list.content.some((file: any) => file.name === name);
  }

  async uploadFile(nodeData: DataNode, name: string, content: string) {
    const serverId = nodeData.key as string;
    const server = this.serverManager.getServerById(serverId);
    if (!server) {
      return ERROR_CODE.SERVER_NOT_FOUND;
    }
    const baseUrl = server.settings.baseUrl;
    const path = `${BASE_PATH}/${name}`;
    await this.contentsManager.save(path, {
      content,
      baseUrl,
      name,
      path,
      type: 'file',
      format: 'text',
    });

    return ERROR_CODE.NO_ERROR;
  }

  async downloadFile(nodeData: DataNode) {
    const { serverId, path } = this.parseNodeKey(nodeData.key as string);
    const server = this.serverManager.getServerById(serverId);
    if (server) {
      const data = await this.contentsManager.getDownloadUrl(path, {
        baseUrl: server.settings.baseUrl,
      });
      download(data, nodeData.title as string);
    }
  }

  async deleteFile(nodeData: DataNode) {
    if (!nodeData.isLeaf) {
      return;
    }
    const { serverId, path } = this.parseNodeKey(nodeData.key as string);
    const server = this.serverManager.getServerById(serverId);
    if (server) {
      await this.contentsManager.delete(path, { baseUrl: server.settings.baseUrl });
      await this.getFileTree();
    }
  }

  async getFileContent(serverId: string, path: string) {
    const decodedPath = decodeURIComponent(path);
    const server = this.serverManager.getServerById(serverId);
    if (server) {
      const data = await this.contentsManager.get(decodedPath, {
        baseUrl: server.settings.baseUrl,
        content: true,
      });
      return data;
    }
  }

  viewFile(nodeData: DataNode) {
    const { serverId, path } = this.parseNodeKey(nodeData.key as string);
    const encodedPath = encodeURIComponent(path);
    window.open(
      `/secretnote/preview?serverId=${serverId}&path=${encodedPath}`,
      '_blank',
    );
  }

  copyPath(nodeData: DataNode) {
    const { path } = this.parseNodeKey(nodeData.key as string);
    navigator.clipboard.writeText(path);
  }

  getFileExt(nodeData: DataNode) {
    const { path } = this.parseNodeKey(nodeData.key as string);
    const ext = this.getFileExtByPath(path);
    return ext;
  }

  getFileExtByPath(path: string) {
    const ext = path.split('.').pop();
    return ext;
  }

  private formatNodeKey(serverId: string, path: string) {
    return `${serverId}|${path}`;
  }

  private parseNodeKey(dataKey: string) {
    const [serverId, path] = dataKey.split('|');
    return { serverId, path };
  }

  private isFileVisible(path: string) {
    const ext = this.getFileExtByPath(path);
    return FILE_EXTS.includes(`.${ext}`);
  }
}
