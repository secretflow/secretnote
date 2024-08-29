const { spawn } = require('child_process');
const { writeFileSync } = require('fs');
const { yellow } = require('colorette');
const svgr = require('esbuild-plugin-svgr');
const { defineConfig } = require('tsup');

/**
 *
 * @param {string} outDir
 * @returns
 */
const emitDeclarations = (outDir) =>
  new Promise((resolve, reject) => {
    const timer = `${yellow('TSC')} .d.ts generated in`;
    console.time(timer);
    console.log(yellow('TSC'), 'Generating .d.ts');
    const proc = spawn(
      'tsc',
      [
        '--emitDeclarationOnly',
        '--declaration',
        '--declarationMap',
        '--skipLibCheck',
        '--declarationDir',
        outDir,
      ],
      { stdio: ['inherit', 'inherit', 'inherit'] },
    );
    proc.on('exit', () => {
      console.timeEnd(timer);
      resolve();
    });
    proc.on('error', reject);
  });

const dtsIndex = `declare const App: () => JSX.Element;
export { App as default };`;

module.exports = defineConfig((overrides) => ({
  outDir: 'dist',
  format: ['esm'], //, 'cjs'],
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
