import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { listModules, verify } from '@launchql/core';
import { errors, getEnvOptions, getPgEnvOptions, getSpawnEnvWithPg, LaunchQLOptions } from '@launchql/types';
import { Logger } from '@launchql/server-utils';
import { verifyCommand } from '@launchql/migrate';
import { execSync } from 'child_process';

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

  let { database, recursive, cwd, 'use-sqitch': useSqitch } = await prompter.prompt(argv, questions);

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
    const pgEnv = getPgEnvOptions();
    if (useSqitch) {
      log.info(`Running: sqitch verify db:pg:${database} (using legacy Sqitch)`);
      execSync(`sqitch verify db:pg:${database}`, {
        cwd,
        env: getSpawnEnvWithPg(pgEnv),
        stdio: 'inherit'
      });
    } else {
      log.info(`Running: launchql migrate verify db:pg:${database}`);
      await verifyCommand(pgEnv, database, cwd);
    }
    log.success('Verify complete.');
  }

  return argv;
};
