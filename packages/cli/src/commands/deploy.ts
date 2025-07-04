import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { ParsedArgs } from 'minimist';

import {
  getEnvOptions,
  LaunchQLOptions
} from '@launchql/types';

import {
  getPgEnvOptions,
  getSpawnEnvWithPg,
} from 'pg-env';

import { deploy, deployWithOptions } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { execSync } from 'child_process';
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
    }
  ];

  let { yes, recursive, createdb, cwd, 'use-sqitch': useSqitch, tx } = await prompter.prompt(argv, questions);

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

  // Handle fast deploy using the unified deploy function
  if (argv.fast && recursive) {
    const options: LaunchQLOptions = getEnvOptions({
      pg: {
        database
      }
    });
    
    const { LaunchQLProject } = await import('@launchql/core');
    const project = new LaunchQLProject(cwd);
    const modules = project.getModuleMap();
    const modulePath = modules[projectName!].path;
    
    await deploy(options, projectName!, database, modulePath, {
      fast: true,
      usePlan: true,
      cache: false
    });
  } else {
    await deployWithOptions({
      database,
      cwd,
      recursive,
      projectName,
      useSqitch,
      useTransaction: tx
    });
  }

  log.success('Deployment complete.');

  return argv;
};
