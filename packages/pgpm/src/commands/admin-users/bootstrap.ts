import { PgpmInit } from '@pgpmjs/core';
import { Logger } from '@pgpmjs/logger';
import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { getPgEnvOptions } from 'pg-env';

const log = new Logger('admin-users-bootstrap');

const bootstrapUsageText = `
Admin Users Bootstrap Command:

  pgpm admin-users bootstrap [OPTIONS]

  Initialize postgres roles and permissions. This command must be run before adding users.
  Creates the standard postgres roles: anonymous, authenticated, administrator.

Options:
  --help, -h              Show this help message
  --cwd <directory>       Working directory (default: current directory)

Examples:
  pgpm admin-users bootstrap              # Initialize postgres roles
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
      message: 'Are you sure you want to initialize postgres roles and permissions?',
      default: false
    }
  ]);

  if (!yes) {
    log.info('Operation cancelled.');
    return;
  }

  const init = new PgpmInit(pgEnv);
  
  try {
    await init.bootstrapRoles();
    log.success('postgres roles and permissions initialized successfully.');
  } finally {
    await init.close();
  }

  return argv;
};
