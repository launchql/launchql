import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { listModules, revert } from '@launchql/core';
import { errors, getEnvOptions, getPgEnvOptions, getSpawnEnvWithPg, LaunchQLOptions } from '@launchql/types';
import { Logger } from '@launchql/server-utils';
import { revertCommand } from '@launchql/migrate';
import { execSync } from 'child_process';

const log = new Logger('revert');

export default async (
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  const questions: Question[] = [
    {
      name: 'database',
      message: 'Database name',
      type: 'text',
      required: true
    },
    {
      name: 'yes',
      type: 'confirm',
      message: 'Are you sure you want to proceed?',
      required: true
    }
  ];

  let { database, yes, recursive, cwd, 'use-sqitch': useSqitch } = await prompter.prompt(argv, questions);

  if (!yes) {
    log.info('Operation cancelled.');
    return;
  }

  if (!cwd) {
    cwd = process.cwd();
    log.debug(`Using current directory: ${cwd}`);
  }

  if (recursive) {
    const modules = await listModules(cwd);
    const mods = Object.keys(modules);

    if (!mods.length) {
      log.error('No modules found to revert.');
      prompter.close();
      throw errors.NOT_FOUND({}, 'No modules found to revert.');
    }

    const { project } = await prompter.prompt(argv, [
      {
        type: 'autocomplete',
        name: 'project',
        message: 'Choose a project to revert',
        options: mods,
        required: true
      }
    ]);

    log.success(`Reverting project ${project} on database ${database}...`);
    const options: LaunchQLOptions = getEnvOptions({
      pg: {
        database
      }
    });

    await revert(options, project, database, cwd);
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
      await revertCommand(pgEnv, database, cwd);
    }
    log.success('Revert complete.');
  }

  return argv;
};
