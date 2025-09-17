import { LaunchQLPackage } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { getEnvOptions } from '@launchql/env';
import { execSync } from 'child_process';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import {
  getPgEnvOptions,
  getSpawnEnvWithPg,
} from 'pg-env';

import { getTargetDatabase } from '../utils';
import { selectPackage } from '../utils/module-utils';

const deployUsageText = `
LaunchQL Deploy Command:

  lql deploy [OPTIONS]

  Deploy database changes and migrations to target database.

Options:
  --help, -h         Show this help message
  --createdb         Create database if it doesn't exist
  --recursive        Deploy recursively through dependencies (default: true)
  --no-recursive     Disable recursive deployment
  --package <name>   Target specific package
  --to <target>      Deploy to specific change or tag
  --tx               Use transactions (default: true)
  --fast             Use fast deployment strategy
  --logOnly          Log-only mode, skip script execution
  --usePlan          Use deployment plan
  --cache            Enable caching
  --cwd <directory>  Working directory (default: current directory)

Examples:
  lql deploy                              Deploy to selected database
  lql deploy --createdb                   Deploy with database creation
  lql deploy --package mypackage --to @v1.0.0  Deploy specific package to tag
  lql deploy --fast --no-tx              Fast deployment without transactions
`;

export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  // Show usage if explicitly requested
  if (argv.help || argv.h) {
    console.log(deployUsageText);
    process.exit(0);
  }
  const pgEnv = getPgEnvOptions();
  const log = new Logger('cli');

  // Get target database
  let database: string;
  
  if (argv.createdb) {
    // Prompt for selection
    ({database} = await prompter.prompt(argv, [
      {
        type: 'text',
        name: 'database',
        message: 'Database name',
        required: true
      }
    ]));
  } else {
    database = await getTargetDatabase(argv, prompter, {
      message: 'Select database'
    });
  }

  const questions: Question[] = [
    {
      name: 'yes',
      type: 'confirm',
      message: 'Are you sure you want to proceed?',
      required: true
    },
    {
      name: 'tx',
      type: 'confirm',
      message: 'Use Transaction?',
      useDefault: true,
      default: true,
      required: false
    },
    {
      name: 'fast',
      type: 'confirm',
      message: 'Use Fast Deployment?',
      useDefault: true,
      default: false,
      required: false
    },
    {
      name: 'logOnly',
      type: 'confirm',
      message: 'Log-only mode (skip script execution)?',
      useDefault: true,
      default: false,
      required: false
    }
  ];

  if (argv.recursive === undefined && !argv['no-recursive']) {
    argv.recursive = true;
  } else if (argv['no-recursive']) {
    argv.recursive = false;
  }

  let { yes, recursive, createdb, cwd, tx, fast, logOnly } = await prompter.prompt(argv, questions);

  if (!yes) {
    log.info('Operation cancelled.');
    return;
  }

  log.debug(`Using current directory: ${cwd}`);

  if (createdb) {
    log.info(`Creating database ${database}...`);
    execSync(`createdb ${database}`, {
      env: getSpawnEnvWithPg(pgEnv)
    });
  }

  let packageName: string | undefined;
  if (recursive) {
    packageName = await selectPackage(argv, prompter, cwd, 'deploy', log);
  }

  const cliOverrides = {
    pg: getPgEnvOptions({ database }),
    deployment: {
      useTx: tx !== false,
      fast: fast !== false,
      usePlan: argv.usePlan !== false,
      cache: argv.cache !== false,
      logOnly: argv.logOnly !== false,
    }
  };
  
  const opts = getEnvOptions(cliOverrides);

  const project = new LaunchQLPackage(cwd);
  
  let target: string | undefined;
  if (packageName && argv.to) {
    target = `${packageName}:${argv.to}`;
  } else if (packageName) {
    target = packageName;
  } else if (argv.package && argv.to) {
    target = `${argv.package}:${argv.to}`;
  } else if (argv.package) {
    target = argv.package as string;
  }
  
  await project.deploy(
    opts,
    target,
    recursive
  );

  log.success('Deployment complete.');

  return argv;
};
