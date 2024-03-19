import { PageConfig, URL as LibroURL } from '@difizen/libro-jupyter';

export const getRemoteBaseUrl = (serverId: string, origin = location.origin) => {
  return origin + '/secretnoteagent/' + serverId;
};

export const getRemoteWsUrl = (serverId: string, origin = location.origin) => {
  return getRemoteBaseUrl(serverId, origin).replace(/^http/, 'ws');
};

export const getLocalBaseUrl = () => {
  return getRemoteBaseUrl('0'); // 0 代表请求本地服务
};

export const getLocalWsUrl = () => {
  return getRemoteWsUrl('0'); // 0 代表请求本地服务
};

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

const normalizeUrl = (url: string, serverId: string, origin: string) => {
  const urlObj = new URL(LibroURL.join(getRemoteBaseUrl(serverId, origin), url));
  return urlObj.href;
};

const getCookie = (name: string): string | undefined => {
  // From http://www.tornadoweb.org/en/stable/guide/security.html
  const matches = document.cookie.match('\\b' + name + '=([^;]*)\\b');
  return matches?.[1];
};

// serverId: 请求会被代理到的目标服务，serverId 为 0 时代表请求本地服务
// origin: 请求的源地址，用于跨域请求
export const request = async (
  url: string,
  init: RequestInit,
  serverId = '0',
  origin = location.origin,
) => {
  let requestUrl = normalizeUrl(url, serverId, origin);

  const cache = init.cache ?? 'no-store';
  if (cache === 'no-store') {
    requestUrl += (/\?/.test(url) ? '&' : '?') + new Date().getTime();
  }

  const req = new window.Request(requestUrl, {
    cache: 'no-store',
    credentials: 'same-origin',
    ...init,
  });

  let authenticated = false;
  const token = PageConfig.getToken();
  if (token) {
    authenticated = true;
    req.headers.append('Authorization', `token ${token}`);
  }
  if (typeof document !== 'undefined' && document?.cookie) {
    const xsrfToken = getCookie('_xsrf');
    if (xsrfToken !== undefined) {
      authenticated = true;
      req.headers.append('X-XSRFToken', xsrfToken);
    }
  }

  if (!req.headers.has('Content-Type') && authenticated) {
    req.headers.set('Content-Type', 'application/json');
  }

  const response = await window.fetch(req);

  if (response.status === 204) {
    return;
  }

  if (response.status === 200) {
    const data = await response.json();
    return data;
  }

  const err = await createResponseError(response);

  throw err;
};
