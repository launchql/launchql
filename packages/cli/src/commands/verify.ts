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

  let projectName: string | undefined;
  let toChange: string | undefined;

  if (recursive) {
    projectName = await selectModule(argv, prompter, 'Choose a project to verify', cwd);
    log.info(`Selected project: ${projectName}`);
    toChange = argv.toChange;
  } else {
    if (argv.toChange) {
      toChange = argv.toChange;
    }
  }

  const project = new LaunchQLProject(cwd);
  
  const opts = getEnvOptions({ 
    pg: getPgEnvOptions({ database })
  });
  
  await project.verify(
    opts,
    projectName,
    toChange,
    recursive
  );

  log.success('Verify complete.');

  return argv;
};
