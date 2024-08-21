import { message } from 'antd';

/**
 * A generic error handler that shows a message and logs the error.
 */
export function genericErrorHandler(e: any, reThrow = false) {
  message.error(e?.message || e.toString());
  // eslint-disable-next-line no-console
  console.error(e);
  if (reThrow) {
    throw e;
  }
}
