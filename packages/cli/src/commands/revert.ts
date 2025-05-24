import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { exec } from 'shelljs';
import { listModules, revert } from '@launchql/core';
import { errors, getEnvOptions, LaunchQLOptions } from '@launchql/types';
import { Logger } from '@launchql/server-utils';

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

  let { database, yes, recursive, cwd } = await prompter.prompt(argv, questions);

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
    log.info(`Running: sqitch revert db:pg:${database} -y`);
    exec(`sqitch revert db:pg:${database} -y`);
    log.success('Revert complete.');
  }

  return argv;
};
