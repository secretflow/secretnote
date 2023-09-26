import { spawn } from 'child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { yellow } from 'colorette';
import { globby } from 'globby';
import type { Options } from 'tsup';

const noop = () => {
  /* ignore */
};

export const emitDeclarations =
  ({
    src = 'src',
    out = 'dist/typing',
    cwd = process.cwd(),
    tsconfig = 'tsconfig.json',
  }: {
    src?: string;
    out?: string;
    cwd?: string;
    tsconfig?: string;
  }) =>
  async () => {
    const timer = `${yellow('TSC')} .d.ts for ${src} generated in`;
    console.time(timer);
    console.log(yellow('TSC'), 'Generating .d.ts');

    const buildinfos = await globby('**/tsconfig.tsbuildinfo', { cwd: src });
    await Promise.all(buildinfos.map((file) => fs.unlink(file).catch(noop)));

    const options = [
      '--project',
      tsconfig,
      '--declaration',
      '--declarationMap',
      '--emitDeclarationOnly',
      '--skipLibCheck',
      '--declarationDir',
      path.resolve(process.cwd(), out),
    ];

    const proc = spawn('tsc', options, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    return new Promise<void>((resolve, reject) => {
      const errors: string[] = [];
      proc.stdout.setEncoding('utf8');
      proc.stdout.on('data', (chunk) => errors.push(chunk));
      proc.on('exit', () => {
        if (proc.exitCode !== 0) {
          console.error(errors.join(''));
          reject(new Error('Failed to generate .d.ts'));
        } else {
          console.timeEnd(timer);
          resolve();
        }
      });
      proc.on('error', reject);
    });
  };

export const outExtension: NonNullable<Options['outExtension']> = ({ format }) => ({
  js: format === 'esm' ? '.mjs' : '.cjs',
});

export const isDevelopment = (options: Options) =>
  process.env['NODE_ENV'] === 'development' || options.watch;

let signalInstalled = false;

export function signal() {
  if (signalInstalled) {
    return;
  }
  process.on('SIGINT', () => process.exit(0));
  process.on('SIGTERM', () => process.exit(0));
  signalInstalled = true;
}

export function defineOptions(options: Options): Options {
  if (options.watch) {
    signal();
  }
  return {
    outDir: 'dist',
    format: ['esm', 'cjs'],
    outExtension,
    sourcemap: true,
    dts: false,
    clean: options.clean || !options.watch,
    ...options,
  };
}
