import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { Logger } from '@launchql/logger';
import { LaunchQLProject } from '@launchql/core';
import { getEnvOptions } from '@launchql/types';
import { getPgEnvOptions } from 'pg-env';
import { getTargetDatabase } from '../utils';
import { selectModule } from '../utils/module-utils';

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
    projectName = await selectModule(argv, prompter, 'Choose a project to revert', cwd);
    log.info(`Selected project: ${projectName}`);
  }

  const project = new LaunchQLProject(cwd);
  
  const opts = getEnvOptions({ 
    pg: getPgEnvOptions({ database }),
    deployment: {
      useTx: tx
    }
  });
  
  await project.revert(
    opts,
    projectName,
    argv.toChange,
    recursive
  );

  log.success('Revert complete.');

  return argv;
};
