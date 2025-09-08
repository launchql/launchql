import { LaunchQLPackage } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';

const validateUsageText = `
LaunchQL Validate Command:

  lql validate [OPTIONS]

  Ensure package is consistent before bumping.

Options:
  --help, -h         Show this help message
  --cwd <directory>  Working directory (default: current directory)

Validation Checks:
  - .control.default_version === package.json.version
  - SQL migration file for current version exists
  - launchql.plan has a tag for current version
  - Dependencies in launchql.plan reference real published versions

Exit Codes:
  0 - Package is valid and consistent
  1 - Inconsistencies found

Examples:
  lql validate                    Validate current module
  lql validate --cwd ./my-module  Validate specific module
`;

export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  if (argv.help || argv.h) {
    console.log(validateUsageText);
    return argv;
  }

  const log = new Logger('validate');
  
  let { cwd } = await prompter.prompt(argv, [
    {
      type: 'text',
      name: 'cwd',
      message: 'Working directory',
      required: false,
      default: process.cwd(),
      useDefault: true
    }
  ]);

  log.debug(`Using directory: ${cwd}`);

  const project = new LaunchQLPackage(cwd);
  const result = project.validateModule();

  if (!result.ok) {
    log.error('Package validation failed:');
    for (const issue of result.issues) {
      log.error(`  ${issue.code}: ${issue.message}`);
      if (issue.file) {
        log.error(`    File: ${issue.file}`);
      }
    }
    throw new Error('Package validation failed');
  } else {
    log.success('Package validation passed');
  }

  return argv;
};
