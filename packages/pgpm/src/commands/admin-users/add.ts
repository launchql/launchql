import { PgpmInit } from '@pgpmjs/core';
import { Logger } from '@pgpmjs/logger';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { getPgEnvOptions } from 'pg-env';

const log = new Logger('admin-users-add');

const addUsageText = `
Admin Users Add Command:

  pgpm admin-users add [OPTIONS]

  Add database users with postgres roles.
  Note: You must run 'pgpm admin-users bootstrap' first to initialize roles.

Options:
  --help, -h              Show this help message
  --username <username>   Username for the database user
  --password <password>   Password for the database user
  --test                  Add test users (app_user, app_admin) with default passwords
  --cwd <directory>       Working directory (default: current directory)

Examples:
  pgpm admin-users add --username myuser --password mypass
  pgpm admin-users add --test                # Add test users (requires bootstrap first)
  pgpm admin-users add                       # Will prompt for username and password
`;

export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  // Show usage if explicitly requested
  if (argv.help || argv.h) {
    console.log(addUsageText);
    process.exit(0);
  }

  const pgEnv = getPgEnvOptions();
  const isTest = argv.test;

  const init = new PgpmInit(pgEnv);
  
  try {
    if (isTest) {
      const { yes: confirmTest } = await prompter.prompt(argv, [
        {
          type: 'confirm',
          name: 'yes',
          message: 'Are you sure you want to add test users? (WARNING: Should NEVER be run on production!)',
          default: false
        }
      ]);

      if (!confirmTest) {
        log.info('Operation cancelled.');
        return;
      }

      await init.bootstrapTestRoles();
      log.success('Test users added successfully.');
    } else {
      const prompts: Question[] = [
        {
          type: 'text',
          name: 'username',
          message: 'Enter username for database user:',
          validate: (input: any) => input && input.trim().length > 0
        },
        {
          type: 'text',
          name: 'password',
          message: 'Enter password for database user:',
          validate: (input: any) => input && input.trim().length > 0
        }
      ];

      const { username, password } = await prompter.prompt(argv, prompts);

      const { yes } = await prompter.prompt(argv, [
        {
          type: 'confirm',
          name: 'yes',
          message: `Are you sure you want to add database user "${username}"?`,
          default: false
        }
      ]);

      if (!yes) {
        log.info('Operation cancelled.');
        return;
      }

      await init.bootstrapDbRoles(username, password);
      log.success(`Database user "${username}" added successfully.`);
    }
  } finally {
    await init.close();
  }

  return argv;
};
