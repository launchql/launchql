import { LaunchQLPackage } from '@launchql/core';
import { getEnvOptions } from '@launchql/env';
import { Logger } from '@launchql/logger';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { getPgEnvOptions } from 'pg-env';

import { getTargetDatabase } from '../utils';
import { cliExitWithError } from '../utils/cli-error';

const log = new Logger('remove');

export default async (
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  
  if (!argv.to) {
    await cliExitWithError('No change specified. Usage: lql remove --to <change>');
  }

  const database = await getTargetDatabase(argv, prompter, {
    message: 'Select database'
  });

  const questions: Question[] = [
    {
      name: 'yes',
      type: 'confirm',
      message: 'Are you sure you want to proceed with removing changes?',
      required: true
    }
  ];

  let { yes, cwd } = await prompter.prompt(argv, questions);

  if (!yes) {
    log.info('Operation cancelled.');
    return;
  }

  log.debug(`Using current directory: ${cwd}`);

  const pkg = new LaunchQLPackage(cwd);
  
  if (!pkg.isInModule()) {
    throw new Error('Not in a LaunchQL module directory. Please run this command from within a module.');
  }

  const opts = getEnvOptions({ 
    pg: getPgEnvOptions({ database })
  });
  
  const toChange = argv.to as string;
  
  await pkg.removeFromPlan(toChange);

  log.success(`✅ Successfully removed changes from '${toChange}' to end of plan.`);

  return argv;
};
