import { LaunchQLProject } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { getEnvOptions } from '@launchql/env';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { getPgEnvOptions } from 'pg-env';

import { getTargetDatabase } from '../utils';
import { selectModule } from '../utils/module-utils';

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

  let { recursive, cwd } = await prompter.prompt(argv, questions);

  log.debug(`Using current directory: ${cwd}`);

  let target: string | undefined;

  if (recursive) {
    const projectName = await selectModule(argv, prompter, 'Choose a project to verify', cwd);
    log.info(`Selected project: ${projectName}`);
    target = argv.toChange ? `${projectName}:${argv.toChange}` : projectName;
  } else {
    target = argv.toChange;
  }

  const project = new LaunchQLProject(cwd);
  
  const opts = getEnvOptions({ 
    pg: getPgEnvOptions({ database })
  });
  
  await project.verify(
    opts,
    target,
    recursive
  );

  log.success('Verify complete.');

  return argv;
};
