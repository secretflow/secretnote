import { defineConfig } from 'umi';

declare global {
  interface Window {
    publicPath: string;
  }
}

const iife = (fn: () => void) => `(${fn.toString()})()`;

const prodConfig = defineConfig({
  publicPath: '{{ static_url_prefix }}/',
  runtimePublicPath: {},
  exportStatic: {},
  favicons: ['{{ static_url_prefix }}/favicon.svg'],
  headScripts: [
    iife(() => {
      window.publicPath = '{{ static_url_prefix }}/';
    }),
    iife(() => {
      // https://github.com/jupyter-server/jupyter_server/blob/8e5d7668aea4eb4d6ca1767566f4ffcbc4bc49bf/jupyter_server/templates/page.html#L25
      window.addEventListener('DOMContentLoaded', () => {
        document.body.dataset['jupyterApiToken'] =
          '{% if logged_in and token %}{{token | urlencode}}{% endif %}';
      });
    }),
  ],
});

export default defineConfig({
  ...prodConfig,
  routes: [
    { path: '/', component: '@/pages/secretnote' },
    { path: '/preview', component: '@/pages/preview' },
    { path: '/lipsum', component: '@/pages/lipsum' },
    { path: '/*', component: '@/pages/404' },
  ],
  // devtool: 'source-map',
  jsMinifier: 'none',
  writeToDisk: true,
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
