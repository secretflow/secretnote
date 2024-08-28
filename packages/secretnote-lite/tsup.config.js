const { spawn } = require('child_process');
const { copyFileSync } = require('fs');
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

module.exports = defineConfig((overrides) => ({
  outDir: 'dist',
  format: ['esm'], //, 'cjs'],
  outExtension: () => ({ js: `.js` }),
  sourcemap: true,
  dts: true,
  loader: {
    '.less': 'copy',
    '.md': 'text',
  },
  esbuildPlugins: [svgr()],
  clean: overrides.clean || !overrides.watch,
}));
