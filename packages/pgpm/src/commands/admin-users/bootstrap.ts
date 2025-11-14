import { LaunchQLInit } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { getPgEnvOptions } from 'pg-env';

const log = new Logger('admin-users-bootstrap');

const bootstrapUsageText = `
LaunchQL Admin Users Bootstrap Command:

  pgpm admin-users bootstrap [OPTIONS]

  Initialize LaunchQL roles and permissions. This command must be run before adding users.
  Creates the standard LaunchQL roles: anonymous, authenticated, administrator.

Options:
  --help, -h              Show this help message
  --cwd <directory>       Working directory (default: current directory)

Examples:
  pgpm admin-users bootstrap              # Initialize LaunchQL roles
`;

export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  // Show usage if explicitly requested
  if (argv.help || argv.h) {
    console.log(bootstrapUsageText);
    process.exit(0);
  }

  const pgEnv = getPgEnvOptions();

  const { yes } = await prompter.prompt(argv, [
    {
      type: 'confirm',
      name: 'yes',
      message: 'Are you sure you want to initialize LaunchQL roles and permissions?',
      default: false
    }
  ]);

  if (!yes) {
    log.info('Operation cancelled.');
    return;
  }

  const init = new LaunchQLInit(pgEnv);
  
  try {
    await init.bootstrapRoles();
    log.success('LaunchQL roles and permissions initialized successfully.');
  } finally {
    await init.close();
  }

  return argv;
};
