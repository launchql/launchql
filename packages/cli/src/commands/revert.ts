import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { LaunchQLProject, revert } from '@launchql/core';
import { errors, getEnvOptions, LaunchQLOptions } from '@launchql/types';
import { getPgEnvOptions, getSpawnEnvWithPg } from 'pg-env';
import { Logger } from '@launchql/logger';
import { revertCommand } from '@launchql/migrate';
import { execSync } from 'child_process';
import { getTargetDatabase } from '../utils';

const log = new Logger('revert');

export default async (
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  
  const database = await getTargetDatabase(argv, prompter, {
    message: 'Select database'
  });

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

  let { yes, recursive, cwd, 'use-sqitch': useSqitch, tx } = await prompter.prompt(argv, questions);

  if (!yes) {
    log.info('Operation cancelled.');
    return;
  }

  log.debug(`Using current directory: ${cwd}`);

  const project = new LaunchQLProject(cwd);

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
        message: 'Choose a project to revert',
        options: moduleNames,
        required: true
      }
    ]);

    log.success(`Reverting project ${selectedProject} on database ${database}...`);
    const options: LaunchQLOptions = getEnvOptions({
      pg: {
        database
      }
    });

    await revert(options, selectedProject, database, cwd, { useSqitch, useTransaction: tx });
    log.success('Revert complete.');
  } else {
    const pgEnv = getPgEnvOptions();
    if (useSqitch) {
      log.info(`Running: sqitch revert db:pg:${database} (using legacy Sqitch)`);
      execSync(`sqitch revert db:pg:${database}`, {
        cwd,
        env: getSpawnEnvWithPg(pgEnv),
        stdio: 'inherit'
      });
    } else {
      log.info(`Running: launchql migrate revert db:pg:${database}`);
      await revertCommand(pgEnv, database, cwd, { useTransaction: tx });
    }
    log.success('Revert complete.');
  }

  return argv;
};
