// @ts-check
import { createRequire } from 'node:module';
import * as process from 'node:process';
import * as readline from 'node:readline';

const require = createRequire(process.cwd() + '/resolve.mjs');
const rl = readline.createInterface({ input: process.stdin });

/**
 * @typedef ResolutionInfo
 * @property {string} bin
 * @property {string} version
 * @property {string} cwd
 * @property {Record<string, string>} resolved
 * @property {string[]} errors
 */

/** @type {ResolutionInfo} */
const info = {
  bin: process.argv[0],
  version: process.version,
  cwd: process.cwd(),
  resolved: {},
  errors: [],
};

for await (const identifier of rl) {
  if (!identifier) {
    continue;
  }
  try {
    const path = require.resolve(identifier);
    info.resolved[identifier] = path;
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      error.code === 'MODULE_NOT_FOUND'
    ) {
      info.errors.push(`${identifier}: Cannot find module`);
    } else {
      info.errors.push(`${identifier}: ${error}`);
    }
  }
}

process.stdout.write(JSON.stringify(info, null, 2));

if (Object.keys(info.errors).length) {
  process.exit(2);
} else {
  process.exit(0);
}
