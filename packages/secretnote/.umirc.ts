import { defineConfig } from 'umi';

export default defineConfig({
  base: '/secretnote',
  publicPath: '/static/secretnote/dist/',
  routes: [{ path: '/', component: 'secretnote' }],
  proxy: {
    '/api': {
      target: 'http://localhost:8888/',
      changeOrigin: true,
      secure: false,
      ws: true,
    },
    '/lsp': {
      target: 'http://localhost:8888/',
      changeOrigin: true,
      secure: false,
      ws: true,
    },
  },
  extraBabelPlugins: [
    'babel-plugin-transform-typescript-metadata',
    'babel-plugin-parameter-decorator',
  ],
  mfsu: false,
  npmClient: 'pnpm',
});
