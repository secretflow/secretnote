import * as child_process from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { promisify } from 'node:util';

import TOML from '@iarna/toml';
import { Command } from 'commander';
import Enquirer from 'enquirer';
import semverRegex from 'semver-regex';
import validateNpmPackageName from 'validate-npm-package-name';
import * as colors from 'yoctocolors';

type SnippetResult<T> = {
  values: T;
  result: string;
};

const { prompt } = Enquirer;

export const clone = new Command('clone').description('Clone a package');

async function main() {
  const gitRoot = await promisify(child_process.exec)(
    'git rev-parse --show-toplevel',
  ).then((result) => result.stdout.trim());

  const { source, destination } = await prompt<{ source: string; destination: string }>(
    [
      {
        type: 'input',
        name: 'source',
        message: 'Path to the package to clone',
        validate: async (input) => {
          if (input.length === 0) {
            return 'Must specify a path';
          }
          try {
            await fs.readFile(path.join(input, 'package.json'));
          } catch (e) {
            return 'No package.json found at path';
          }
          return true;
        },
        result: (value) => path.resolve(value),
      },
      {
        type: 'input',
        name: 'destination',
        message: 'Path to output the cloned package in',
        validate: async (input) => {
          if (input.length === 0) {
            return 'Must specify a path';
          }
          try {
            await fs.stat(input);
            return 'Path already exists';
          } catch (e) {
            //
          }
          const resolvedPath = path.resolve(input);
          if (!resolvedPath.startsWith(gitRoot)) {
            return 'Path must be within the git root';
          }
          return true;
        },
        result: (value) => path.resolve(value),
      },
    ],
  );

  const relativeSourcePath = path.relative(gitRoot, source);
  const relativeDestinationPath = path.relative(gitRoot, destination);

  const packageJSON = await (async () => {
    try {
      const content = await fs.readFile(path.join(source, 'package.json'), 'utf-8');
      const parsed = JSON.parse(content);
      return { content, parsed };
    } catch (e) {
      throw new Error('Cannot read package.json');
    }
  })();

  const topLevelFiles = new Set(await fs.readdir(source));

  topLevelFiles.delete('package.json');
  topLevelFiles.delete('pyproject.toml');

  try {
    const { stdout } = await promisify(child_process.exec)('git check-ignore * .*', {
      cwd: source,
    });
    const ignoredFiles = stdout.split('\n');
    ignoredFiles.forEach((file) => topLevelFiles.delete(file));
  } catch (e) {
    // Most likely no files were ignored
  }

  const { includeFiles } = await prompt<{ includeFiles: string[] }>({
    type: 'multiselect',
    name: 'includeFiles',
    message: 'Which additional files/folders do you want to copy over?',
    choices: [...topLevelFiles],
    sort: true,
  });

  const pyprojectTOML = await (async () => {
    try {
      const content = await fs.readFile(path.join(source, 'pyproject.toml'), 'utf-8');
      const parsed = TOML.parse(content);
      return { content, parsed };
    } catch (e) {
      return null;
    }
  })();

  const updatedPyProject = await (async () => {
    if (!pyprojectTOML) {
      return null;
    }

    console.log(colors.blue('pyproject.toml found, treating this as a Python package'));

    // @ts-expect-error untyped data
    const projectName: string = pyprojectTOML.parsed.project.name;
    const template = pyprojectTOML.content
      .replace(relativeSourcePath, relativeDestinationPath)
      .replace(projectName, '${projectName}');

    const {
      data: { result },
    } = await prompt<{ data: SnippetResult<{ name: string }> }>({
      type: 'snippet',
      name: 'data',
      message: 'Please update pyproject.toml:',
      template,
      required: true,
    });

    return result;
  })();

  const updatedPackageJSON = await (async () => {
    const copy = JSON.parse(packageJSON.content);

    copy.name = '${name}';
    copy.version = '${version}';
    copy.description = '${description}';

    const template = JSON.stringify(copy, null, 2);

    type PackageJSONSnippet = SnippetResult<{
      name: string;
      version: string;
      description: string;
    }>;

    const {
      data: { result },
    } = await prompt<{ data: PackageJSONSnippet }>({
      type: 'snippet',
      name: 'data',
      message: 'Please update package.json:',
      template,
      required: true,
      // @ts-expect-error incorrect typing from upstream
      validate: (r: PackageJSONSnippet) => {
        if (!validateNpmPackageName(r.values.name).validForNewPackages) {
          return 'Invalid package name';
        }
        if (!semverRegex().test(r.values.version)) {
          return 'Invalid version';
        }
        return true;
      },
    });

    return result;
  })();

  await fs.mkdir(destination, { recursive: true });
  await Promise.all(
    includeFiles.map((p) => {
      console.log(`Copying ${p} ...`);
      return fs.cp(path.join(source, p), path.join(destination, p), {
        recursive: true,
      });
    }),
  );

  console.log('Writing package.json...');
  await fs.writeFile(path.join(destination, 'package.json'), updatedPackageJSON, {
    flag: 'w+',
  });

  if (updatedPyProject) {
    console.log('Writing pyproject.toml...');
    await fs.writeFile(path.join(destination, 'pyproject.toml'), updatedPyProject, {
      flag: 'w+',
    });
  }

  console.log(colors.green(colors.bold('Done!')));
}

clone.action(() =>
  main().catch((e) => {
    if (!e) {
      console.error('Aborted!');
    } else {
      console.error(e);
    }
    process.exit(1);
  }),
);
