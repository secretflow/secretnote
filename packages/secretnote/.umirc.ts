import { defineConfig } from 'umi';

export default defineConfig({
  // This is not portable at all
  base: '/secretnote/',
  publicPath: '/secretnote/',
  favicons: ['/secretnote/favicon.svg'],
  exportStatic: {},
  routes: [
    { path: '/', redirect: '/scql/project' },
    { path: '/secretflow', component: 'secretflow' },
    { path: '/preview', component: 'preview' },
    { path: '/scql/project', component: 'scql-project' },
    { path: '/scql/project/:id', component: 'scql-workspace' },
  ],
  // devtool: 'source-map',
  writeToDisk: true,
  headScripts:
    process.env.NODE_ENV !== 'development'
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
