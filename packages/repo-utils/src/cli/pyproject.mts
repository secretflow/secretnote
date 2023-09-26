import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { Command } from 'commander';

export const pyproject = new Command('pyproject').description(
  'Utils for Python projects',
);

pyproject
  .command('link')
  .description(
    'Link packages in node_modules to `src` directories' +
      ' so that they can be referenced as data files using importlib.resources.files',
  )
  .option('-n, --deps <deps...>', 'Name of the Node package to link from', [])
  .option('-p, --modules <modules...>', 'Name of the Python modules to link to', [])
  .action(async ({ deps, modules }: { deps: string[]; modules: string[] }) => {
    if (deps.length === 0) {
      console.error('Error: must specify at least one Node dependency to link from');
      process.exit(1);
    }
    if (modules.length === 0) {
      console.error('Error: must specify at least one Python module to link to');
      process.exit(1);
    }
    try {
      await fs.stat('pyproject.toml');
    } catch (e) {
      console.error(
        'Error: must be run from the root of a Python project' +
          ' (pyproject.toml not found in current directory)',
      );
      process.exit(1);
    }
    await Promise.all(
      modules.map(async (module) => {
        await Promise.all(
          deps.map(async (dep) => {
            const destination = `src/${module}/assets/node_modules/${dep}`;
            await fs.mkdir(path.join(destination, '..'), { recursive: true });
            const relpath = path.relative(
              path.resolve(path.dirname(destination)),
              path.resolve(`node_modules/${dep}`),
            );
            try {
              await fs.symlink(relpath, destination);
            } catch (e) {
              if (e instanceof Error && 'code' in e && e.code !== 'EEXIST') {
                console.log('Skipping', dep, 'because it is already linked');
              } else {
                throw e;
              }
            }
            console.log(`Linked ${dep} to ${destination}`);
          }),
        );
      }),
    );
  });
