import { defineConfig, mergeConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { dependencies, peerDependencies } from './package.json';

export default defineConfig(({ mode }) => {
  let dependencyConfig;

  if (mode === 'browser') {
    dependencyConfig = defineConfig({
      build: {
        outDir: 'dist/browser',
        target: 'ES2015',
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
      },
    }),
    dependencyConfig,
    true,
  );
});
