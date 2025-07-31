import { LaunchQLPackage } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { getEnvOptions } from '@launchql/env';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { getPgEnvOptions } from 'pg-env';
import { parsePlanFile } from '@launchql/core';
import path from 'path';

import { getTargetDatabase } from '../utils';

const log = new Logger('clear');

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
      message: 'Are you sure you want to clear ALL changes from the plan? This will remove all changes and their associated files.',
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

  const modulePath = pkg.getModulePath();
  if (!modulePath) {
    throw new Error('Could not resolve module path');
  }
  
  const planPath = path.join(modulePath, 'launchql.plan');
  const result = parsePlanFile(planPath);
  
  if (result.errors.length > 0) {
    throw new Error(`Failed to parse plan file: ${result.errors.map(e => e.message).join(', ')}`);
  }
  
  const plan = result.data!;
  
  if (plan.changes.length === 0) {
    log.info('Plan is already empty - nothing to clear.');
    return;
  }
  
  const firstChange = plan.changes[0].name;
  log.info(`Found ${plan.changes.length} changes in plan. Clearing from first change: ${firstChange}`);
  
  const opts = getEnvOptions({ 
    pg: getPgEnvOptions({ database })
  });
  
  await pkg.removeFromPlan(firstChange);

  log.success(`✅ Successfully cleared all changes from the plan.`);

  return argv;
};
