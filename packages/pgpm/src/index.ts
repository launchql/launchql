#!/usr/bin/env node
import { CLI, CLIOptions } from 'inquirerer';

import { commands } from './commands';
import { readAndParsePackageJson } from './package';

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
    const pkg = readAndParsePackageJson();
    console.log(`${pkg.name}@${pkg.version}`);
    process.exit(0);
  }

  const app = new CLI(commands, options);

  app.run().then(()=> {
    // all done!
  }).catch(error => {
    // Should not reach here with the new CLI error handling pattern
    // But keep as fallback for unexpected errors
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

export { commands, createPgpmCommandMap } from './commands';
