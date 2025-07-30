import { LaunchQLProject } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { getEnvOptions } from '@launchql/env';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';
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
    if (argv.project) {
      projectName = argv.project as string;
      log.info(`Using specified project: ${projectName}`);
      
      const project = new LaunchQLProject(cwd);
      const modules = await project.getModules();
      const moduleNames = modules.map(mod => mod.getModuleName());
      
      if (!moduleNames.includes(projectName)) {
        log.error(`Project '${projectName}' not found. Available projects: ${moduleNames.join(', ')}`);
        return;
      }
    } else {
      // Fall back to interactive selection
      projectName = await selectModule(argv, prompter, 'Choose a project to revert', cwd);
      log.info(`Selected project: ${projectName}`);
    }
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
