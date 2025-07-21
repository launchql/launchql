import { LaunchQLProject } from '@launchql/core';
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
import { selectModule } from '../utils/module-utils';

export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
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

  let projectName: string | undefined;
  if (recursive) {
    projectName = await selectModule(argv, prompter, 'Choose a project to deploy', cwd);
    log.info(`Selected project: ${projectName}`);
  }

  const cliOverrides = {
    pg: getPgEnvOptions({ database }),
    deployment: {
      useTx: tx,
      fast,
      usePlan: argv.usePlan,
      cache: argv.cache,
      logOnly
    }
  };
  
  const opts = getEnvOptions(cliOverrides);

  const project = new LaunchQLProject(cwd);
  
  let target: string | undefined;
  if (projectName && argv.toChange) {
    target = `${projectName}:${argv.toChange}`;
  } else if (projectName) {
    target = projectName;
  }
  
  await project.deploy(
    opts,
    target,
    recursive
  );

  log.success('Deployment complete.');

  return argv;
};
