import { localStorageService } from '@/modules/storage/local-storage-service';
import { PageConfig, URL as LibroURL } from '@difizen/libro-jupyter';
import { genericErrorHandler } from './error';

export const getRemoteBaseUrl = (serverId: string, origin = location.origin) => {
  return origin + '/secretnoteagent/' + serverId;
};

export const getRemoteWsUrl = (serverId: string, origin = location.origin) => {
  return getRemoteBaseUrl(serverId, origin).replace(/^http/, 'ws');
};

/**
 * Get the authentication token from the local storage.
 */
export const getToken = (): string | null => {
  const key =
    (localStorageService.getData('globalConfig') as any)?.tokenKey || 'pocketbase_auth';
  const auth = localStorage.getItem(key);
  if (auth) {
    try {
      return JSON.parse(auth).token;
    } catch (e) {
      genericErrorHandler(e);
      return null;
    }
  }
  return null;
};

/**
 * Default server connection settings and token for API about notebooks.
 */
export const getDefaultServerConnectionSettings = () => {
  return {
    init: {
      cache: 'no-store',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    token: getToken(),
    appendToken: true,
  } as any;
};

/**
 * Normalize a URL, prepending the base URL of a remote server.
 * If `targetId` is provided, the base URL goes into a specific K8s Pod.
 * Otherwise it goes to the default web server.
 */
const normalizeURL = (url: string, targetId = '') => {
  const urlObj = new URL(LibroURL.join(getRemoteBaseUrl(targetId), url));
  return urlObj.href;
};

/**
 * Make a never-cache HTTP request to the server.
 * If `targetId` is provided, the request goes into a specific K8s Pod.
 * Otherwise it goes to the default web server.
 * Token will be carried if there are any.
 * This method will not unpack the Response to JSON.
 */
export const requestNoUnpack = async (
  url: string,
  init: RequestInit,
  targetId = '',
) => {
  // normalize the URL
  let requestUrl = normalizeURL(url, targetId);
  // forcely avoid caching by adding a timestamp
  // because some clients or servers might not handle cache headers properly
  requestUrl += (/\?/.test(url) ? '&' : '?') + new Date().getTime();

  // construct the Request for fetch API
  const req = new window.Request(requestUrl, {
    cache: 'no-store',
    credentials: 'same-origin',
    ...init,
  });
  // handle authentication
  const token = getToken();
  token && req.headers.append('Authorization', token);
  // handle XSRF protection
  if (document?.cookie) {
    const xsrfToken = getCookie('_xsrf');
    xsrfToken && req.headers.append('X-XSRFToken', xsrfToken);
  }
  // all requests are JSON
  req.headers.set('Content-Type', 'application/json');

  // fire the request
  return await window.fetch(req);
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

const normalizeUrl = (url: string, serverId: string) => {
  const urlObj = new URL(LibroURL.join(getRemoteBaseUrl(serverId), url));
  return urlObj.href;
};

const getCookie = (name: string): string | undefined => {
  // From http://www.tornadoweb.org/en/stable/guide/security.html
  const matches = document.cookie.match('\\b' + name + '=([^;]*)\\b');
  return matches?.[1];
};

// serverId: 请求会被代理到的目标服务，serverId 为 0 时代表请求本地服务
export const request = async <T>(
  url: string,
  init: RequestInit,
  serverId = '0',
): Promise<T> => {
  let requestUrl = normalizeUrl(url, serverId);

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
    return {} as T;
  }

  if (response.status === 200) {
    const data = await response.json();
    return data;
  }

  const err = await createResponseError(response);

  throw err;
};
