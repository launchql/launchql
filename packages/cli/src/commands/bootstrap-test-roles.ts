import { LaunchQLInit } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { getPgEnvOptions } from 'pg-env';

const log = new Logger('bootstrap-test-roles');

const bootstrapTestRolesUsageText = `
LaunchQL Bootstrap Test Roles Command:

  lql bootstrap-test-roles [OPTIONS]

  Initialize LaunchQL database roles for testing (roles only, no users).

Options:
  --help, -h              Show this help message
  --cwd <directory>       Working directory (default: current directory)

Examples:
  lql bootstrap-test-roles     Bootstrap test roles in selected database
`;

export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  // Show usage if explicitly requested
  if (argv.help || argv.h) {
    console.log(bootstrapTestRolesUsageText);
    process.exit(0);
  }

  const pgEnv = getPgEnvOptions();

  const { yes } = await prompter.prompt(argv, [
    {
      type: 'confirm',
      name: 'yes',
      message: 'Are you sure you want to bootstrap LaunchQL test roles?',
      default: false
    }
  ]);

  if (!yes) {
    log.info('Operation cancelled.');
    return;
  }

  const init = new LaunchQLInit(pgEnv);
  
  try {
    await init.bootstrapTestRoles();
    log.success('Bootstrap test roles complete.');
  } finally {
    await init.close();
  }

  return argv;
};
