import { message } from 'antd';

/**
 * A generic error handler that shows a message and logs the error.
 */
export function genericErrorHandler(
  e: any,
  options: {
    silent?: boolean;
    reThrow?: boolean;
  } = {},
) {
  if (!options?.silent) {
    message.error(e?.message || e.toString());
    console.error(e);
  }
  // eslint-disable-next-line no-console
  if (options?.reThrow) {
    throw e;
  }
}

/**
 * Create an not-implemented function placeholder.
 */
export function createNotImplemented(name: string) {
  return (...args: any) => {
    throw new Error(`Method \`${name}\` is not implemented.`);
    return void 0 as any;
  };
}
