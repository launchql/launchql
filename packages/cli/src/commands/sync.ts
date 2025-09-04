import { LaunchQLPackage } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';

const syncUsageText = `
LaunchQL Sync Command:

  lql sync [OPTIONS]

  Synchronize artifacts with the new bumped version.

Options:
  --help, -h         Show this help message
  --cwd <directory>  Working directory (default: current directory)

Behavior:
  - Reads package.json version
  - Updates PostgreSQL control file with default_version = '<version>'
  - Generates SQL migration file (sql/<extension>--<version>.sql)

Examples:
  lql sync                    Sync current module
  lql sync --cwd ./my-module  Sync specific module
`;

export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  if (argv.help || argv.h) {
    console.log(syncUsageText);
    return argv;
  }

  const log = new Logger('sync');
  
  let { cwd } = await prompter.prompt(argv, [
    {
      type: 'text',
      name: 'cwd',
      message: 'Working directory',
      required: false,
      default: process.cwd(),
      useDefault: true
    }
  ]);

  log.debug(`Using directory: ${cwd}`);

  const project = new LaunchQLPackage(cwd);
  const result = project.syncModule();

  if (!result.success) {
    log.error(`Sync failed: ${result.message}`);
    throw new Error(result.message);
  }

  log.success(result.message);
  for (const file of result.files) {
    if (file.includes('--')) {
      log.success(`Created SQL migration file: ${file}`);
    } else {
      log.success(`Updated control file: ${file}`);
    }
  }

  return argv;
};
