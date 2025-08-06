import { LaunchQLInit } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { getPgEnvOptions } from 'pg-env';

const log = new Logger('bootstrap-db-roles');

const bootstrapDbRolesUsageText = `
LaunchQL Bootstrap Database Roles Command:

  lql bootstrap-db-roles [OPTIONS]

  Initialize LaunchQL database roles with custom username and password.

Options:
  --help, -h              Show this help message
  --username <username>   Username for the database role
  --password <password>   Password for the database role
  --cwd <directory>       Working directory (default: current directory)

Examples:
  lql bootstrap-db-roles --username myuser --password mypass
  lql bootstrap-db-roles     # Will prompt for username and password
`;

export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  // Show usage if explicitly requested
  if (argv.help || argv.h) {
    console.log(bootstrapDbRolesUsageText);
    process.exit(0);
  }

  const pgEnv = getPgEnvOptions();

  const { username, password } = await prompter.prompt(argv, [
    {
      type: 'text',
      name: 'username',
      message: 'Enter username for database role:',
      validate: (input: any) => input && input.trim().length > 0
    },
    {
      type: 'text',
      name: 'password',
      message: 'Enter password for database role:',
      validate: (input: any) => input && input.trim().length > 0
    }
  ]);

  const { yes } = await prompter.prompt(argv, [
    {
      type: 'confirm',
      name: 'yes',
      message: `Are you sure you want to bootstrap database roles for user "${username}"?`,
      default: false
    }
  ]);

  if (!yes) {
    log.info('Operation cancelled.');
    return;
  }

  const init = new LaunchQLInit(pgEnv);
  
  try {
    await init.bootstrapDbRoles(username, password);
    log.success(`Bootstrap database roles complete for user: ${username}`);
  } finally {
    await init.close();
  }

  return argv;
};
