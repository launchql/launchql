import { PgpmPackage } from '@pgpmjs/core';
import { getEnvOptions } from '@pgpmjs/env';
import { Logger } from '@pgpmjs/logger';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { getPgEnvOptions } from 'pg-env';

import { getTargetDatabase, resolvePackageAlias } from '../utils';
import { cliExitWithError } from '../utils/cli-error';
import { selectDeployedChange, selectDeployedPackage } from '../utils/deployed-changes';

const log = new Logger('revert');


const revertUsageText = `
Revert Command:

  pgpm revert [OPTIONS]

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
  pgpm revert                    Revert latest changes
  pgpm revert --to @v1.0.0      Revert to specific tag
  pgpm revert --to              Interactive selection from deployed changes
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
      name: 'recursive',
      type: 'confirm',
      message: 'Deploy recursively through dependencies?',
      useDefault: true,
      default: true,
      required: false
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
  if (recursive && argv.to !== true) {
    packageName = await selectDeployedPackage(database, argv, prompter, log, 'revert', cwd);
    if (!packageName) {
      await cliExitWithError('No package found to revert');
    }
  }

  const pkg = new PgpmPackage(cwd);
  
  const opts = getEnvOptions({ 
    pg: getPgEnvOptions({ database }),
    deployment: {
      useTx: tx
    }
  });
  
  let target: string | undefined;
  
  if (argv.to === true) {
    target = await selectDeployedChange(database, argv, prompter, log, 'revert', cwd);
    if (!target) {
      await cliExitWithError('No target selected, operation cancelled');
    }
  }else if (packageName && argv.to) {
    target = `${packageName}:${argv.to}`;
  } else if (packageName) {
    target = packageName;
  } else if (argv.package && argv.to) {
    const resolvedPackage = resolvePackageAlias(argv.package as string, cwd);
    target = `${resolvedPackage}:${argv.to}`;
  } else if (argv.package) {
    target = resolvePackageAlias(argv.package as string, cwd);
  }
  
  await pkg.revert(
    opts,
    target,
    recursive
  );

  log.success('Revert complete.');

  return argv;
};
