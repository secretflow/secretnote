import { defineApp } from 'umi';

declare global {
  interface Window {
    publicPath: string;
  }
}

export default defineApp({
  // https://github.com/umijs/umi/discussions/11241#discussioncomment-6100650
  modifyContextOpts(opts: Record<string, unknown>) {
    if (typeof window.publicPath !== 'string') {
      return;
    }
    // https://reactrouter.com/en/main/router-components/browser-router#basename
    opts.basename = window.publicPath.replace(/\/$/, '');
    return opts;
  },
});
