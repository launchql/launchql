import { LaunchQLPackage } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { getEnvOptions } from '@launchql/env';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { getPgEnvOptions } from 'pg-env';

import { getTargetDatabase } from '../utils';
import { selectPackage } from '../utils/module-utils';

const log = new Logger('revert');

const revertUsageText = `
LaunchQL Revert Command:

  lql revert [OPTIONS]

  Revert database changes and migrations.

Options:
  --help, -h         Show this help message
  --recursive        Revert recursively through dependencies
  --package <name>   Revert specific package
  --to <target>      Revert to specific change or tag
  --tx               Use transactions (default: true)
  --cwd <directory>  Working directory (default: current directory)

Examples:
  lql revert                    Revert latest changes
  lql revert --to @v1.0.0      Revert to specific tag
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
  if (packageName && argv.to) {
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
