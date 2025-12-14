import { PgpmPackage } from '@pgpmjs/core';
import { parsePlanFile } from '@pgpmjs/core';
import { getEnvOptions } from '@pgpmjs/env';
import { Logger } from '@pgpmjs/logger';
import { errors } from '@pgpmjs/types';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import path from 'path';
import { getPgEnvOptions } from 'pg-env';

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

  const pkg = new PgpmPackage(cwd);
  
  if (!pkg.isInModule()) {
    throw new Error('Not in a PGPM module directory. Please run this command from within a module.');
  }

  const modulePath = pkg.getModulePath();
  if (!modulePath) {
    throw new Error('Could not resolve module path');
  }
  
  const planPath = path.join(modulePath, 'pgpm.plan');
  const result = parsePlanFile(planPath);
  
  if (result.errors.length > 0) {
    throw errors.PLAN_PARSE_ERROR({ planPath, errors: result.errors.map(e => e.message).join(', ') });
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
