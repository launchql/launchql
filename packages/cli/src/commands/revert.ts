import { LaunchQLProject } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { getEnvOptions } from '@launchql/env';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { getPgEnvOptions } from 'pg-env';

import { getTargetDatabase } from '../utils';
import { selectProject } from '../utils/module-utils';

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

  let { yes, recursive, cwd, tx } = await prompter.prompt(argv, questions);

  if (!yes) {
    log.info('Operation cancelled.');
    return;
  }

  log.debug(`Using current directory: ${cwd}`);

  let projectName: string | undefined;
  if (recursive) {
    projectName = await selectProject(argv, prompter, cwd, 'revert', log);
  }

  const project = new LaunchQLProject(cwd);
  
  const opts = getEnvOptions({ 
    pg: getPgEnvOptions({ database }),
    deployment: {
      useTx: tx
    }
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
  
  await project.revert(
    opts,
    target,
    recursive
  );

  log.success('Revert complete.');

  return argv;
};
