#!/usr/bin/env node
import { readFileSync } from 'fs';
import { CLI, CLIOptions } from 'inquirerer';
import { join } from 'path';

import { commands, createPgpmCommandMap } from './commands';
export { createInitUsageText } from './commands/init';

export { createPgpmCommandMap };

export { default as add } from './commands/add';
export { default as adminUsers } from './commands/admin-users';
export { default as analyze } from './commands/analyze';
export { default as clear } from './commands/clear';
export { default as deploy } from './commands/deploy';
export { default as docker } from './commands/docker';
export { default as env } from './commands/env';
export { default as _export } from './commands/export';
export { default as extension } from './commands/extension';
export { default as install } from './commands/install';
export { default as kill } from './commands/kill';
export { default as migrate } from './commands/migrate';
export { default as _package } from './commands/package';
export { default as plan } from './commands/plan';
export { default as remove } from './commands/remove';
export { default as renameCmd } from './commands/rename';
export { default as revert } from './commands/revert';
export { default as tag } from './commands/tag';
export { default as verify } from './commands/verify';
export * from './utils';

export const options: Partial<CLIOptions> = {
  minimistOpts: {
    alias: {
      v: 'version',
      h: 'help'
    }
  }
};

if (require.main === module) {
  if (process.argv.includes('--version') || process.argv.includes('-v')) {
    const pkgPath = join(__dirname, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    console.log(pkg.version);
    process.exit(0);
  }

  const app = new CLI(commands, options);

  app.run().then(()=> {
  }).catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}
