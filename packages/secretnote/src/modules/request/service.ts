import { ServerConnection } from '@difizen/libro-jupyter';
import { inject, singleton } from '@difizen/mana-app';

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

  async request(url: string, init: RequestInit, address?: string) {
    const settings = { ...this.serverConnection.settings };

    if (address) {
      settings.baseUrl = `http://${address}/`;
      settings.wsUrl = `ws://${address}/`;
    }

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

  private getUrl(baseUrl: string, url: string) {
    return baseUrl + url;
  }
}
