const { writeFileSync } = require('fs');
const svgr = require('esbuild-plugin-svgr');
const { defineConfig } = require('tsup');

const dtsIndex = `
declare const App: (props: {
  backendURL?: string;
  tokenKey?: string;
}) => JSX.Element;
export { App as default };`.trim();

module.exports = defineConfig((overrides) => ({
  outDir: 'dist',
  format: ['esm'],
  outExtension: () => ({ js: `.js` }),
  sourcemap: true,
  dts: false,
  loader: {
    '.less': 'copy',
    '.md': 'text',
  },
  esbuildPlugins: [svgr()],
  onSuccess() {
    writeFileSync('./dist/index.d.ts', dtsIndex);
  },
  clean: overrides.clean || !overrides.watch,
}));