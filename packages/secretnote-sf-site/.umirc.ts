import { defineConfig } from 'umi';

export default defineConfig({
  // This is not portable at all
  base: '/secretnote/',
  publicPath: '/secretnote/',
  favicons: ['/secretnote/favicon.svg'],
  title: 'SecretNote SF Playground',
  exportStatic: {},
  routes: [{ path: '/', component: 'index' }],
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
  // proxy for development
  proxy: {
    // '/secretnote': {
    //   target: 'http://localhost:8888/',
    //   changeOrigin: true,
    //   secure: false,
    //   ws: true,
    // },
  },
  extraBabelPlugins: [],
  mfsu: false,
  npmClient: 'pnpm',
  esbuildMinifyIIFE: true,
});
