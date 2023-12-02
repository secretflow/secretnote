import { ServerConnection, URL } from '@difizen/libro-jupyter';
import { inject, singleton } from '@difizen/mana-app';

import type { IServer } from '@/modules/server';

export class ResponseError extends Error {
  response: Response;
  traceback: string;
  constructor(
    response: Response,
    message = `The response is invalid: ${response.status} ${response.statusText}`,
    traceback = '',
  ) {
    super(message);
    this.response = response;
    this.traceback = traceback;
  }
}

export const createResponseError = async (response: Response) => {
  try {
    const data = await response.json();
    if (data.message) {
      return new ResponseError(response, data.message);
    }
    return new ResponseError(response);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
    return new ResponseError(response);
  }
};

@singleton()
export class RequestService {
  protected readonly serverConnection: ServerConnection;

  constructor(@inject(ServerConnection) serverConnection: ServerConnection) {
    this.serverConnection = serverConnection;
  }

  async request(url: string, init: RequestInit, server?: IServer) {
    const settings = this.getSettings(server);
    const response = await this.serverConnection.makeRequest(
      this.getUrl(settings.baseUrl, url),
      init,
      settings,
    );

    if (response.status === 204) {
      return;
    }

    if (response.status === 200) {
      const data = await response.json();
      return data;
    }

    const err = await createResponseError(response);
    throw err;
  }

  private getSettings(server?: IServer) {
    const settings = {
      ...this.serverConnection.settings,
      ...(server && getServerUrl(server)),
    };
    return settings;
  }

  private getUrl(baseUrl: string, url: string, ...args: string[]) {
    const parts = args.map((path) => URL.encodeParts(path));
    return URL.join(baseUrl, url, ...parts);
  }
}

export const getServerUrl = (server: IServer) => {
  return {
    baseUrl: `http://${server.address}/`,
    wsUrl: `ws://${server.address}/`,
  };
};
