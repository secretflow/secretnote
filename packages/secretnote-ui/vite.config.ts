import react from '@vitejs/plugin-react-swc';
import { defineConfig, mergeConfig } from 'vite';

import { dependencies, peerDependencies } from './package.json';

const isDev = process.env['NODE_ENV'] === 'development';

export default defineConfig(({ mode }) => {
  let dependencyConfig;

  if (mode === 'browser') {
    dependencyConfig = defineConfig({
      build: {
        outDir: 'dist/browser',
        target: 'ES2015',
        sourcemap: isDev ? 'inline' : false,
      },
      define: { 'process.env.NODE_ENV': JSON.stringify(process.env['NODE_ENV']) },
      resolve: {
        alias: Object.fromEntries(
          [...Object.entries(peerDependencies), ...Object.entries(dependencies)].map(
            ([k, v]) => [k, `https://esm.sh/${k}@${v}`],
          ),
        ),
      },
    });
  } else if (mode === 'esm') {
    dependencyConfig = defineConfig({
      build: {
        outDir: 'dist/esm',
        rollupOptions: {
          external: [
            ...Object.keys(peerDependencies),
            ...Object.keys(dependencies),
            'react/jsx-runtime',
          ],
        },
        sourcemap: true,
      },
    });
  } else {
    throw new Error(`Invalid build mode: ${mode}`);
  }

  return mergeConfig(
    defineConfig({
      plugins: [react()],
      build: {
        lib: {
          entry: './src/index.ts',
          formats: ['es'],
        },
        rollupOptions: {
          output: {
            entryFileNames: '[name].js',
          },
        },
        minify: process.env['NODE_ENV'] === 'production' ? 'esbuild' : false,
        sourcemap: true,
      },
    }),
    dependencyConfig,
    true,
  );
});
