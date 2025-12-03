#!/usr/bin/env node
import { readFileSync } from 'fs';
import { CLI, CLIOptions } from 'inquirerer';
import { join } from 'path';

import { commands } from './commands';
import { checkForUpdates } from 'pgpm';

export const options: Partial<CLIOptions> = {
  minimistOpts: {
    alias: {
      v: 'version',
      h: 'help'
    }
  }
};

async function main() {
  // Run update check early so --version path also triggers it
  try {
    const pkgPath = join(__dirname, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    await checkForUpdates({
      command: process.argv[2],
      packageName: pkg.name,
      pkgVersion: pkg.version,
      toolName: pkg.name === '@launchql/cli' ? 'launchql-cli' : pkg.name
    });
  } catch {
    // ignore update check failures
  }

  if (process.argv.includes('--version') || process.argv.includes('-v')) {
    const pkgPath = join(__dirname, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    console.log(pkg.version);
    process.exit(0);
  }

  const app = new CLI(commands, options);

  await app.run();
}

main().catch(error => {
  // Should not reach here with the new CLI error handling pattern
  // But keep as fallback for unexpected errors
  console.error('Unexpected error:', error);
  process.exit(1);
});
