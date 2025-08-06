import { LaunchQLInit } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { getPgEnvOptions } from 'pg-env';

const log = new Logger('bootstrap');

const bootstrapUsageText = `
LaunchQL Bootstrap Command:

  lql bootstrap [OPTIONS]

  Initialize all LaunchQL database roles (standard roles and test roles).

Options:
  --help, -h              Show this help message
  --cwd <directory>       Working directory (default: current directory)

Examples:
  lql bootstrap     Bootstrap all roles in selected database
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
      message: 'Are you sure you want to bootstrap all LaunchQL roles?',
      default: false
    }
  ]);

  if (!yes) {
    log.info('Operation cancelled.');
    return;
  }

  const init = new LaunchQLInit(pgEnv);
  
  try {
    log.info('Bootstrapping LaunchQL database...');
    
    log.info('Step 1/2: Bootstrapping roles...');
    await init.bootstrapRoles();
    log.success('Roles bootstrapped successfully');
    
    log.info('Step 2/2: Bootstrapping test roles...');
    await init.bootstrapTestRoles();
    log.success('Test roles bootstrapped successfully');
    
    log.success('LaunchQL database bootstrap completed successfully!');
  } finally {
    await init.close();
  }

  return argv;
};
