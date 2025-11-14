import { LaunchQLPackage } from '@launchql/core';
import { getEnvOptions } from '@launchql/env';
import { Logger } from '@launchql/logger';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { getPgEnvOptions } from 'pg-env';

import { getTargetDatabase } from '../utils';
import { cliExitWithError } from '../utils/cli-error';
import { selectDeployedChange, selectDeployedPackage } from '../utils/deployed-changes';

const log = new Logger('verify');

const verifyUsageText = `
Verify Command:

  pgpm verify [OPTIONS]

  Verify database state matches expected migrations.

Options:
  --help, -h         Show this help message
  --recursive        Verify recursively through dependencies
  --package <name>   Verify specific package
  --to <target>      Verify up to specific change or tag
  --to               Interactive selection of deployed changes
  --cwd <directory>  Working directory (default: current directory)

Examples:
  pgpm verify                    Verify current database state
  pgpm verify --package mypackage  Verify specific package
  pgpm verify --to              Interactive selection from deployed changes
`;

export default async (
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  // Show usage if explicitly requested
  if (argv.help || argv.h) {
    console.log(verifyUsageText);
    process.exit(0);
  }
  const database = await getTargetDatabase(argv, prompter, {
    message: 'Select database'
  });

  const questions: Question[] = [
    {
      name: 'recursive',
      type: 'confirm',
      message: 'Deploy recursively through dependencies?',
      useDefault: true,
      default: true,
      required: false
    },
  ];

  let { recursive, cwd } = await prompter.prompt(argv, questions);

  log.debug(`Using current directory: ${cwd}`);

  let packageName: string | undefined;
  if (recursive && argv.to !== true) {
    packageName = await selectDeployedPackage(database, argv, prompter, log, 'verify');
    if (!packageName) {
      await cliExitWithError('No package found to verify');
    }
  }

  const project = new LaunchQLPackage(cwd);
  
  const opts = getEnvOptions({ 
    pg: getPgEnvOptions({ database })
  });
  
  let target: string | undefined;
  
  if (argv.to === true) {
    target = await selectDeployedChange(database, argv, prompter, log, 'verify');
    if (!target) {
      await cliExitWithError('No target selected, operation cancelled');
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
  
  await project.verify(
    opts,
    target,
    recursive
  );

  log.success('Verify complete.');

  return argv;
};
