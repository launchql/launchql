import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { ParsedArgs } from 'minimist';

import {
  errors,
  getEnvOptions,
  getPgEnvOptions,
  getSpawnEnvWithPg,
  LaunchQLOptions
} from '@launchql/types';

import { deploy, deployFast } from '@launchql/core';
import { Logger } from '@launchql/server-utils';
import { execSync } from 'child_process';
import { LaunchQLProject } from '@launchql/core';
import { deployCommand } from '@launchql/migrate';

export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  const pgEnv = getPgEnvOptions();
  const log = new Logger('cli');

  const questions: Question[] = [
    {
      type: 'text',
      name: 'database',
      message: 'Database name',
      required: true
    },
    {
      name: 'yes',
      type: 'confirm',
      message: 'Are you sure you want to proceed?',
      required: true
    }
  ];

  let { database, yes, recursive, createdb, cwd, 'use-sqitch': useSqitch } = await prompter.prompt(argv, questions);

  if (!yes) {
    log.info('Operation cancelled.');
    return;
  }

  cwd = cwd || process.cwd();
  log.debug(`Using current directory: ${cwd}`);

  const project = new LaunchQLProject(cwd);

  if (createdb) {
    log.info(`Creating database ${database}...`);
    execSync(`createdb ${database}`, {
      env: getSpawnEnvWithPg(pgEnv)
    });
  }

  const options: LaunchQLOptions = getEnvOptions({
    pg: {
      database
    }
  });

  if (recursive) {
    const modules = await project.getModules();
    const moduleNames = modules.map(mod => mod.getModuleName());

    if (!moduleNames.length) {
      log.error('No modules found in the specified directory.');
      prompter.close();
      throw errors.NOT_FOUND({}, 'No modules found in the specified directory.');
    }

    const { project: selectedProject } = await prompter.prompt(argv, [
      {
        type: 'autocomplete',
        name: 'project',
        message: 'Choose a project to deploy',
        options: moduleNames,
        required: true
      }
    ]);

    const selected = modules.find(mod => mod.getModuleName() === selectedProject);
    if (!selected) {
      throw new Error(`Module ${selectedProject} not found`);
    }

    const dir = selected.getModulePath()!;
    log.success(`Deploying project ${selectedProject} from ${dir} to database ${database}...`);

    if (argv.fast) {
      await deployFast({
        opts: options,
        database,
        dir,
        name: selectedProject,
        usePlan: true,
        cache: false
      });
    } else {
      await deploy(options, selectedProject, database, dir, { useSqitch });
    }

    log.success('Deployment complete.');
  } else {
    if (useSqitch) {
      log.info(`Running: sqitch deploy db:pg:${database} (using legacy Sqitch)`);
      execSync(`sqitch deploy db:pg:${database}`, {
        cwd,
        env: getSpawnEnvWithPg(pgEnv),
        stdio: 'inherit'
      });
    } else {
      log.info(`Running: launchql migrate deploy db:pg:${database}`);
      await deployCommand(pgEnv, database, cwd);
    }
    log.success('Deployment complete.');
  }

  return argv;
};
