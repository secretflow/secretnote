import { Command } from 'commander';

import { version } from '../../package.json';

import { clone } from './clone.mjs';

const program = new Command();

program.name('repo-utils').version(version).addCommand(clone).parse();
