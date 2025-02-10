/**
 * Create a Promise that resolves after a given time.
 */
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * A noop function that returns a Promise.
 */
export const anoop = async () => {};
