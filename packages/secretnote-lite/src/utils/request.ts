import { URL as LibroURL } from '@difizen/libro-jupyter';

export const getRemoteBaseUrl = (targetId = '', endSlash = false) => {
  const backendUrl = process.env.SECRETNOTE_BACKEND_URL;
  const origin =
    !backendUrl || backendUrl === '/' ? window.location.origin : backendUrl;

  return origin + '/secretnote/' + targetId + `${endSlash ? '/' : ''}`;
};

export const getRemoteWsUrl = (targetId = '', endSlash = false) => {
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

const normalizeUrl = (url: string, targetId = '') => {
  const urlObj = new URL(LibroURL.join(getRemoteBaseUrl(targetId), url));
  return urlObj.href;
};

const getCookie = (name: string): string | undefined => {
  // From http://www.tornadoweb.org/en/stable/guide/security.html
  const matches = document.cookie.match('\\b' + name + '=([^;]*)\\b');
  return matches?.[1];
};

export const getToken = () => {
  const auth = localStorage.getItem('pocketbase_auth');
  if (auth) {
    try {
      const parsedAuth = JSON.parse(auth);
      return parsedAuth.token;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return null;
    }
  }
  return null;
};

export const getInit: () => RequestInit = () => {
  return {
    cache: 'no-store',
    credentials: 'same-origin',
    headers: {
      Authorization: getToken(),
      'Content-Type': 'application/json',
    },
  };
};

export const request = async (url: string, init: RequestInit, targetId = '') => {
  let requestUrl = normalizeUrl(url, targetId);

  const cache = init.cache ?? 'no-store';
  if (cache === 'no-store') {
    requestUrl += (/\?/.test(url) ? '&' : '?') + new Date().getTime();
  }

  const req = new window.Request(requestUrl, {
    cache: 'no-store',
    credentials: 'same-origin',
    ...init,
  });

  const token = getToken();
  if (token) {
    req.headers.append('Authorization', token);
  }
  if (typeof document !== 'undefined' && document?.cookie) {
    const xsrfToken = getCookie('_xsrf');
    if (xsrfToken !== undefined) {
      req.headers.append('X-XSRFToken', xsrfToken);
    }
  }

  req.headers.set('Content-Type', 'application/json');

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
