import { message } from 'antd';

export function getErrorString(e: any) {
  return e?.message ?? e.toString() ?? '';
}

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
  // eslint-disable-next-line no-console
  console.error(e);
  if (!options?.silent) {
    message.error(getErrorString(e));
  }
  if (options?.reThrow) {
    throw e;
  }
}

/**
 * Create an not-implemented function placeholder that throws.
 */
export function createNotImplemented(name: string) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (..._: any) => {
    throw new Error(`Method \`${name}\` is not implemented.`);
    return void 0 as any;
  };
}
