import { defineConfig } from 'umi';

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  base: '/secretnote/',
  publicPath: '/secretnote/',
  favicons: ['/secretnote/favicon.svg'],
  title: 'SecretNote SF Playground',
  routes: [
    // don't break the original URL
    { path: '/', component: 'sf-workspace' },
    // this page is only used for developing the sf-preview
    ...(isDev ? [{ path: '/_preview', component: 'sf-preview' }] : []),
  ],
  writeToDisk: true,
  headScripts: isDev
    ? [
        `(${(() => {
          // https://github.com/jupyter-server/jupyter_server/blob/8e5d7668aea4eb4d6ca1767566f4ffcbc4bc49bf/jupyter_server/templates/page.html#L25
          window.addEventListener('DOMContentLoaded', () => {
            document.body.dataset['jupyterApiToken'] =
              '{% if logged_in and token %}{{token | urlencode}}{% endif %}';
          });
        }).toString()})()`,
      ]
    : false,
  // proxy for development
  proxy: {
    '/secretnote': {
      target: 'http://localhost:8888/',
      changeOrigin: true,
      secure: false,
      ws: true,
    },
  },
  extraBabelPlugins: [],
  mfsu: false,
  npmClient: 'pnpm',
  esbuildMinifyIIFE: true,
});
