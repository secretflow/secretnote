/**
 * Create a Promise that resolves after a given time.
 */
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * A noop function that returns a Promise.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const anoop = async () => {};
