import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { LaunchQLProject, verify } from '@launchql/core';
import { errors, getEnvOptions, LaunchQLOptions } from '@launchql/types';
import { getPgEnvOptions, getSpawnEnvWithPg } from 'pg-env';
import { Logger } from '@launchql/logger';
import { verifyCommand } from '@launchql/migrate';
import { execSync } from 'child_process';
import { getTargetDatabase } from '../utils';

const log = new Logger('verify');

export default async (
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  const database = await getTargetDatabase(argv, prompter, {
    message: 'Select database'
  });

  const questions: Question[] = [];

  let { recursive, cwd, 'use-sqitch': useSqitch } = await prompter.prompt(argv, questions);

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
        message: 'Choose a project to verify',
        options: moduleNames,
        required: true
      }
    ]);

    const options: LaunchQLOptions = getEnvOptions({
      pg: {
        database
      }
    });

    log.info(`Verifying project ${selectedProject} on database ${database}...`);
    await verify(options, selectedProject, database, cwd, { useSqitch });
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
