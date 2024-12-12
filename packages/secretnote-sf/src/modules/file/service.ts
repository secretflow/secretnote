import {
  ContentsFileFormat,
  ContentsManager,
  type IContentsModel,
} from '@difizen/libro-jupyter';
import { inject, prop, singleton } from '@difizen/mana-app';
import type { TreeDataNode } from 'antd';
import { l10n } from '@difizen/mana-l10n';

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

  @prop() fileTree: TreeDataNode[] | null = null;

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

  private onServerChanged() {
    this.getFileTree();
  }

  /**
   * Update and get the user file tree on a server.
   */
  async getFileTree() {
    const maybeServerList = await this.serverManager.getServerList();
    if (!maybeServerList) {
      genericErrorHandler(l10n.t('获取 Server 列表失败'));
      return;
    }

    // iterate through the server list and get the file tree for each server
    const servers = maybeServerList.filter((s) => s.status === ServerStatus.Succeeded);
    const fileTree: TreeDataNode[] = [];
    for (const server of servers) {
      const serverNode: TreeDataNode = {
        title: server.name,
        key: server.id,
        children: [],
      };
      try {
        const { content: list }: { content: IContentsModel[] } =
          await this.contentsManager.get(BASE_PATH, {
            baseUrl: getRemoteBaseUrl(server.id),
            content: true,
          });
        const fileNodes = list
          .filter((file) => this.isFileVisible(file.path)) // filter out hidden files
          .map((file) => ({
            title: file.name,
            key: this.formatNodeKey(server.id, server.name, file.path),
            isLeaf: true, // no nested file is considered for now
          }))
          .sort((a, b) => a.title.localeCompare(b.title));
        serverNode.children = fileNodes;
        fileTree.push(serverNode);
      } catch (err) {
        genericErrorHandler(err);
      }
    }

    return (this.fileTree = fileTree);
  }

  /**
   * Check if a user file on a server is existed.
   */
  async isFileExisted(nodeData: TreeDataNode, name: string): Promise<boolean> {
    const server = await this.serverManager.getServerDetail(nodeData.key as string);
    if (!server) {
      return false;
    }

    const { content: list }: { content: IContentsModel[] } =
      await this.contentsManager.get(BASE_PATH, {
        baseUrl: getRemoteBaseUrl(server.id),
        content: true,
      });

    return list.some((file) => file.name === name);
  }

  /**
   * Upload file via Jupyter Server. All files are treated as binary, uploaded with base64 format,
   * and chunked if possible.
   *
   * @see https://github.com/jupyterlab/jupyterlab/blob/main/packages/filebrowser/src/model.ts
   */
  async uploadFile(nodeData: TreeDataNode, name: string, file: File) {
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
  async downloadFile(nodeData: TreeDataNode) {
    const { serverId = '', path = '' } = FileService.parseNodeKey(
      nodeData.key as string,
    );
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

  /**
   * Delete file from computation node.
   */
  async deleteFile(nodeData: TreeDataNode) {
    if (!nodeData.isLeaf) {
      return;
    }
    const { serverId = '', path = '' } = FileService.parseNodeKey(
      nodeData.key as string,
    );
    const server = await this.serverManager.getServerDetail(serverId);
    if (server) {
      await this.contentsManager.delete(path, {
        baseUrl: getRemoteBaseUrl(server.id),
      });
      await this.getFileTree();
    }
  }

  /**
   * Get file content from computation node.
   */
  async getFileContent(serverId: string, path: string, format?: ContentsFileFormat) {
    const decodedPath = decodeURIComponent(path);
    const server = await this.serverManager.getServerDetail(serverId);
    if (server) {
      const data = await this.contentsManager.get(decodedPath, {
        baseUrl: getRemoteBaseUrl(server.id),
        content: true,
        format,
      });
      return data;
    }
  }

  /**
   * Copy file path to clipboard.
   */
  async copyPath(nodeData: TreeDataNode) {
    const { path } = FileService.parseNodeKey(nodeData.key as string);
    // TODO Get the actual folder path from the server.
    return await copyToClipboard(`/home/secretnote/workspace/${path}`);
  }

  /**
   * Get file extension from node data.
   */
  static getFileExt(nodeData: TreeDataNode, lowerCase = true) {
    const { path } = FileService.parseNodeKey(nodeData.key as string);
    return FileService.getFileExtByPath(path ?? '', lowerCase);
  }

  /**
   * Get file extension from file path.
   */
  static getFileExtByPath(path: string, lowerCase = true) {
    const ext = path?.split('.').pop();
    return lowerCase ? ext?.toLowerCase() : ext;
  }

  /**
   * Store the metadata of each file in node key with the format [serverId, serverName, path].
   */
  private formatNodeKey(serverId: string, serverName: string, path: string) {
    return [serverId, serverName, path].join('|');
  }

  /**
   * Extrate the metadata of file from node key.
   */
  static parseNodeKey(dataKey: string) {
    type MaybeString = string | undefined;
    const [serverId, serverName, path] = dataKey.split('|') as MaybeString[];

    return { serverId, serverName, path };
  }

  /**
   * Currently no files limitation. All files are visible.
   */
  private isFileVisible(path: string) {
    return true;
  }
}
