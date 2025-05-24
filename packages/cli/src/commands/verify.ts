import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { exec } from 'shelljs';
import { listModules, verify } from '@launchql/core';
import { errors, getEnvOptions, LaunchQLOptions } from '@launchql/types';
import { Logger } from '@launchql/server-utils';

const log = new Logger('verify');

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
    }
  ];

  let { database, recursive, cwd } = await prompter.prompt(argv, questions);

  if (!cwd) {
    cwd = process.cwd();
    log.debug(`Using current directory: ${cwd}`);
  }

  if (recursive) {
    const modules = await listModules(cwd);
    const mods = Object.keys(modules);

    if (!mods.length) {
      log.error('No modules found to verify.');
      prompter.close();
      throw errors.NOT_FOUND({}, 'No modules found to verify.');
    }

    const { project } = await prompter.prompt(argv, [
      {
        type: 'autocomplete',
        name: 'project',
        message: 'Choose a project to verify',
        options: mods,
        required: true
      }
    ]);

    const options: LaunchQLOptions = getEnvOptions({
      pg: {
        database
      }
    });

    log.info(`Verifying project ${project} on database ${database}...`);
    await verify(options, project, database, cwd);
    log.success('Verify complete.');
  } else {
    log.info(`Running: sqitch verify db:pg:${database}`);
    exec(`sqitch verify db:pg:${database}`);
    log.success('Verify complete.');
  }

  return argv;
};
