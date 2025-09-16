import { LaunchQLPackage, LaunchQLMigrate, StatusResult } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { getEnvOptions } from '@launchql/env';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { getPgEnvOptions } from 'pg-env';

import { getTargetDatabase } from '../utils';
import { selectPackage } from '../utils/module-utils';

const log = new Logger('revert');

async function selectDeployedChange(
  database: string,
  prompter: Inquirerer,
  log: Logger
): Promise<string | undefined> {
  const pgEnv = getPgEnvOptions({ database });
  const client = new LaunchQLMigrate({
    host: pgEnv.host,
    port: pgEnv.port,
    user: pgEnv.user,
    password: pgEnv.password,
    database: pgEnv.database
  });

  try {
    const packageStatuses = await client.status();
    
    if (packageStatuses.length === 0) {
      log.warn('No deployed packages found in database');
      return undefined;
    }

    const packageAnswer = await prompter.prompt({}, [{
      type: 'autocomplete',
      name: 'selectedPackage',
      message: 'Select package to revert from:',
      options: packageStatuses.map(status => ({
        name: status.package,
        value: status.package,
        description: `${status.totalDeployed} changes, last: ${status.lastChange}`
      }))
    }]);
    const selectedPackage = (packageAnswer as any).selectedPackage;

    const deployedChanges = await client.getDeployedChanges(database, selectedPackage);
    
    if (deployedChanges.length === 0) {
      log.warn(`No deployed changes found for package ${selectedPackage}`);
      return undefined;
    }

    const changeAnswer = await prompter.prompt({}, [{
      type: 'autocomplete',
      name: 'selectedChange',
      message: `Select change to revert to in ${selectedPackage}:`,
      options: deployedChanges.map(change => ({
        name: change.change_name,
        value: change.change_name,
        description: `Deployed: ${new Date(change.deployed_at).toLocaleString()}`
      }))
    }]);
    const selectedChange = (changeAnswer as any).selectedChange;

    return `${selectedPackage}:${selectedChange}`;
    
  } catch (error) {
    log.error('Failed to query deployed changes:', error);
    log.info('Falling back to non-interactive mode');
    return undefined;
  }
}

const revertUsageText = `
LaunchQL Revert Command:

  lql revert [OPTIONS]

  Revert database changes and migrations.

Options:
  --help, -h         Show this help message
  --recursive        Revert recursively through dependencies
  --package <name>   Revert specific package
  --to <target>      Revert to specific change or tag
  --to               Interactive selection of deployed changes
  --tx               Use transactions (default: true)
  --cwd <directory>  Working directory (default: current directory)

Examples:
  lql revert                    Revert latest changes
  lql revert --to @v1.0.0      Revert to specific tag
  lql revert --to              Interactive selection from deployed changes
`;

export default async (
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  // Show usage if explicitly requested
  if (argv.help || argv.h) {
    console.log(revertUsageText);
    process.exit(0);
  }
  
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

  let packageName: string | undefined;
  if (recursive) {
    packageName = await selectPackage(argv, prompter, cwd, 'revert', log);
  }

  const pkg = new LaunchQLPackage(cwd);
  
  const opts = getEnvOptions({ 
    pg: getPgEnvOptions({ database }),
    deployment: {
      useTx: tx
    }
  });
  
  let target: string | undefined;
  
  if (argv.to === true) {
    target = await selectDeployedChange(database, prompter, log);
    if (!target) {
      log.info('No target selected, operation cancelled.');
      return argv;
    }
  } else if (packageName && argv.to) {
    target = `${packageName}:${argv.to}`;
  } else if (packageName) {
    target = packageName;
  } else if (argv.package && argv.to) {
    target = `${argv.package}:${argv.to}`;
  } else if (argv.package) {
    target = argv.package as string;
  }
  
  await pkg.revert(
    opts,
    target,
    recursive
  );

  log.success('Revert complete.');

  return argv;
};
