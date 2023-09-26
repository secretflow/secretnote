// @ts-check

import { defineConfig } from 'tsup';

export default [
  defineConfig({
    format: ['esm'],
    entry: ['./src/index.mts'],
    outDir: './dist',
    outExtension: () => ({ js: '.mjs' }),
  }),
  defineConfig({
    format: ['esm'],
    entry: ['./src/cli/index.mts'],
    outDir: './dist/cli',
    outExtension: () => ({ js: '.mjs' }),
  }),
];
