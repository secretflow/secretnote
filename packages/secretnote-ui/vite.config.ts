import react from '@vitejs/plugin-react-swc';
import { defineConfig, mergeConfig } from 'vite';

import { dependencies, peerDependencies } from './package.json';

const isDev = process.env['NODE_ENV'] === 'development';

const define = { 'process.env.NODE_ENV': JSON.stringify(process.env['NODE_ENV']) };

export default defineConfig(({ mode }) => {
  const dependencyConfig = (() => {
    switch (mode) {
      case 'browser':
      case 'deno':
      case 'development':
        // zero bundle for <script type="module">
        return defineConfig({
          build: {
            outDir: 'dist/browser',
            target: 'ES2015',
          },
          define,
          resolve: {
            alias: Object.fromEntries(
              [
                ...Object.entries(peerDependencies),
                ...Object.entries(dependencies),
              ].map(([k, v]) => [k, `https://esm.sh/${k}@${v}`]),
            ),
          },
        });
      case 'esm':
        // standard ES module
        return defineConfig({
          build: {
            outDir: 'dist/esm',
            rollupOptions: {
              external: [
                ...Object.keys(peerDependencies),
                ...Object.keys(dependencies),
              ].map((k) => new RegExp(`^${k}(/|$)`)),
            },
          },
        });
      case 'esm-bundled':
      case 'production':
        return defineConfig({
          build: {
            outDir: 'dist/esm-bundled',
          },
          define,
        });
      default:
        throw new Error(`Unsupported mode "${mode}. See vite.config.ts"`);
    }
  })();

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
        sourcemap: isDev ? 'inline' : false,
      },
    }),
    dependencyConfig,
    true,
  );
});
