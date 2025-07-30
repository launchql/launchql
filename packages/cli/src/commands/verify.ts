import { LaunchQLProject } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { getEnvOptions } from '@launchql/env';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { getPgEnvOptions } from 'pg-env';

import { getTargetDatabase } from '../utils';
import { selectProject } from '../utils/module-utils';

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
  if (recursive) {
    projectName = await selectProject(argv, prompter, cwd, 'verify', log);
  }

  const project = new LaunchQLProject(cwd);
  
  const opts = getEnvOptions({ 
    pg: getPgEnvOptions({ database })
  });
  
  let target: string | undefined;
  if (projectName && argv.to) {
    target = `${projectName}:${argv.to}`;
  } else if (projectName) {
    target = projectName;
  } else if (argv.project && argv.to) {
    target = `${argv.project}:${argv.to}`;
  } else if (argv.project) {
    target = argv.project as string;
  }
  
  await project.verify(
    opts,
    target,
    recursive
  );

  log.success('Verify complete.');

  return argv;
};
