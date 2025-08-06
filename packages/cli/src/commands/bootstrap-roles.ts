import { LaunchQLInit } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { getPgEnvOptions } from 'pg-env';

const log = new Logger('bootstrap-roles');

const bootstrapRolesUsageText = `
LaunchQL Bootstrap Roles Command:

  lql bootstrap-roles [OPTIONS]

  Initialize standard LaunchQL database roles (anonymous, authenticated, administrator).

Options:
  --help, -h              Show this help message
  --cwd <directory>       Working directory (default: current directory)

Examples:
  lql bootstrap-roles     Bootstrap roles in selected database
`;

export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  // Show usage if explicitly requested
  if (argv.help || argv.h) {
    console.log(bootstrapRolesUsageText);
    process.exit(0);
  }

  const pgEnv = getPgEnvOptions();

  const { yes } = await prompter.prompt(argv, [
    {
      type: 'confirm',
      name: 'yes',
      message: 'Are you sure you want to bootstrap LaunchQL roles?',
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
    log.success('Bootstrap roles complete.');
  } finally {
    await init.close();
  }

  return argv;
};
