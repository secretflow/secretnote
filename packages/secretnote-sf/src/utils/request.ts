// Customized request definitions and functions for SecretNote.

import { URL as LibroURL, type ISettings } from '@difizen/libro-jupyter';

import { genericErrorHandler } from './error';
import { getGlobalConfig } from '@/modules/storage/local-storage-service';

/**
 * Get the base URL of a remote server for HTTP requests.
 * If `targetId` is provided, the base URL goes into a specific K8s Pod.
 * Otherwise it goes to the default web server.
 */
export const getRemoteBaseUrl = (targetId = '', endSlash = false) => {
  // Try to get the backend URL from the global config (component props)
  const backendUrl = getGlobalConfig()?.backendURL ?? '/';
  const origin =
    !backendUrl || backendUrl === '/' ? window.location.origin : backendUrl;

  // normalize the origin
  return origin.replace(/\/$/, '') + `/secretnote/${targetId}${endSlash ? '/' : ''}`;
};

/**
 * Get the base URL of a remote server for WebSocket requests.
 * If `targetId` is provided, the base URL goes into a specific K8s Pod.
 * Otherwise it goes to the default web server.
 */
export const getRemoteWsUrl = (targetId = '', endSlash = false) => {
  // support ws and wss
  return getRemoteBaseUrl(targetId, endSlash).replace(/^http/, 'ws');
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

/**
 * Create a ResponseError from a Response object.
 */
export const createResponseError = async (response: Response) => {
  try {
    const data = await response.json();
    return new ResponseError(response, data?.message);
  } catch (e) {
    genericErrorHandler(e, { silent: true });
    return new ResponseError(response);
  }
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
 * Get a cookie by name.
 */
const getCookie = (name: string) => {
  // from http://www.tornadoweb.org/en/stable/guide/security.html
  const matches = document.cookie.match('\\b' + name + '=([^;]*)\\b');
  return matches?.[1];
};

/**
 * Get the authentication token from the local storage.
 */
export const getToken = (): string | null => {
  const key = getGlobalConfig()?.tokenKey || 'pocketbase_auth';
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
  } as Partial<ISettings>;
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

/**
 * Make a never-cache HTTP request to the server.
 * If `targetId` is provided, the request goes into a specific K8s Pod.
 * Otherwise it goes to the default web server.
 * Token will be carried if there are any.
 */
export const request = async <T = any>(
  url: string,
  init: RequestInit,
  targetId = '',
): Promise<T> => {
  const response = await requestNoUnpack(url, init, targetId);
  // handle the response
  if (response.status === 204) {
    return {} as T;
  }
  if (response.status === 200) {
    return await response.json();
  }
  throw await createResponseError(response);
};
