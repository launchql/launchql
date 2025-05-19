import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { exec } from 'shelljs';

import { errors, getEnvOptions, LaunchQLOptions } from '@launchql/types';
import { listModules, deploy } from '@launchql/migrate';
import { Logger } from '@launchql/server-utils';

export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
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

  let { database, yes, recursive, createdb, cwd } = await prompter.prompt(argv, questions);

  if (!yes) {
    log.info('Operation cancelled.');
    return;
  }

  if (!cwd) {
    cwd = process.cwd();
    log.debug(`Using current directory: ${cwd}`);
  }

  if (createdb) {
    log.info(`Creating database ${database}...`);
    exec(`createdb ${database}`);
  }

  if (recursive) {
    const modules = await listModules(cwd);
    const mods = Object.keys(modules);

    if (!mods.length) {
      log.error('No modules found in the specified directory.');
      prompter.close();
      throw errors.NOT_FOUND({}, 'No modules found in the specified directory.');
    }

    const { project } = await prompter.prompt(argv, [
      {
        type: 'autocomplete',
        name: 'project',
        message: 'Choose a project to deploy',
        options: mods,
        required: true
      }
    ]);

    log.success(`Deploying project ${project} to database ${database}...`);
    const options: LaunchQLOptions = getEnvOptions({
      pg: {
        database
      }
    });

    await deploy(options, project, database, cwd);
    log.success('Deployment complete.');
  } else {
    log.info(`Running: sqitch deploy db:pg:${database}`);
    exec(`sqitch deploy db:pg:${database}`);
    log.success('Deployment complete.');
  }

  return argv;
};
