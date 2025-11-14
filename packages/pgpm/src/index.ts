#!/usr/bin/env node
import { readFileSync } from 'fs';
import { CLI, CLIOptions } from 'inquirerer';
import { join } from 'path';

import { commands, createPgpmCommandMap } from './commands';

export { createPgpmCommandMap };

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
