import { message } from 'antd';

/**
 * A generic error handler that shows a message and logs the error.
 * @param e The error to handle.
 * @param options Options for the handler.
 * @param options.passthrough If true, the error will be thrown back to the caller without logging.
 */
export function genericErrorHandler(
  e: any,
  options: {
    passthrough?: boolean;
    silent?: boolean;
    reThrow?: boolean;
  } = {},
) {
  console.error(e);
  const { passthrough } = options;
  let { silent, reThrow } = options;
  if (passthrough) {
    silent = reThrow = true;
  }
  if (!silent) {
    message.error(e?.message || e.toString());
  }
  // eslint-disable-next-line no-console
  if (reThrow) {
    throw e;
  }
}

/**
 * Create an not-implemented function placeholder.
 */
export function createNotImplemented(name: string) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (..._: any) => {
    throw new Error(`Method \`${name}\` is not implemented.`);
    return void 0 as any;
  };
}
