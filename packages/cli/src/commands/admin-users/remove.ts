import { LaunchQLInit } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { getPgEnvOptions } from 'pg-env';

const log = new Logger('admin-users-remove');

const removeUsageText = `
LaunchQL Admin Users Remove Command:

  lql admin-users remove [OPTIONS]

  Remove database users and revoke their LaunchQL roles.

Options:
  --help, -h              Show this help message
  --username <username>   Username for the database user to remove
  --test                  Remove test users (app_user, app_admin)
  --cwd <directory>       Working directory (default: current directory)

Examples:
  lql admin-users remove --username myuser
  lql admin-users remove --test             # Remove test users
  lql admin-users remove                    # Will prompt for username
`;

export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  // Show usage if explicitly requested
  if (argv.help || argv.h) {
    console.log(removeUsageText);
    process.exit(0);
  }

  const pgEnv = getPgEnvOptions();
  const isTest = argv.test;

  const init = new LaunchQLInit(pgEnv);
  
  try {
    if (isTest) {
      const { yes: confirmTest } = await prompter.prompt(argv, [
        {
          type: 'confirm',
          name: 'yes',
          message: 'Are you sure you want to remove LaunchQL test users (app_user, app_admin)?',
          default: false
        }
      ]);

      if (!confirmTest) {
        log.info('Operation cancelled.');
        return;
      }

      await init.removeDbRoles('app_user');
      await init.removeDbRoles('app_admin');
      log.success('Test users removed successfully.');
    } else {
      const prompts: Question[] = [
        {
          type: 'text',
          name: 'username',
          message: 'Enter username for database user to remove:',
          validate: (input: any) => input && input.trim().length > 0
        }
      ];

      const { username } = await prompter.prompt(argv, prompts);

      const { yes } = await prompter.prompt(argv, [
        {
          type: 'confirm',
          name: 'yes',
          message: `Are you sure you want to remove database user "${username}"?`,
          default: false
        }
      ]);

      if (!yes) {
        log.info('Operation cancelled.');
        return;
      }

      await init.removeDbRoles(username);
      log.success(`Database user "${username}" removed successfully.`);
    }
  } finally {
    await init.close();
  }

  return argv;
};
