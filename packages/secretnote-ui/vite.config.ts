import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { dependencies, peerDependencies } from './package.json';

export default defineConfig(({ mode }) => {
  if (mode === 'browser') {
    return defineConfig({
      plugins: [react()],
      build: {
        outDir: 'dist/browser',
        lib: {
          formats: ['es'],
          entry: ['./src/index.ts'],
        },
        target: 'ES2020',
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
  } else {
    return defineConfig({
      plugins: [react()],
      build: {
        outDir: 'dist/esm',
        lib: {
          formats: ['es'],
          entry: ['./src/index.ts'],
        },
        rollupOptions: {
          external: [
            ...Object.keys(peerDependencies),
            ...Object.keys(dependencies),
            'react/jsx-runtime',
          ],
        },
      },
    });
  }
});
