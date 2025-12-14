import { PgpmPackage, writePackage } from '@pgpmjs/core';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';

const packageUsageText = `
Package Command:

  pgpm package [OPTIONS]

  Package module for distribution.

Options:
  --help, -h                      Show this help message
  --plan                          Include deployment plan (default: true)
  --pretty                        Pretty-print output (default: true)
  --functionDelimiter <delimiter> Function delimiter (default: $EOFCODE$)
  --cwd <directory>               Working directory (default: current directory)

Examples:
  pgpm package                     Package with defaults
  pgpm package --no-plan           Package without plan
`;

export default async (
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  // Show usage if explicitly requested
  if (argv.help || argv.h) {
    console.log(packageUsageText);
    process.exit(0);
  }
  const questions: Question[] = [
    {
      type: 'confirm',
      name: 'plan',
      default: true,
      useDefault: true,
      required: true
    },
    {
      type: 'confirm',
      name: 'pretty',
      default: true,
      useDefault: true,
      required: true
    },
    {
      type: 'text',
      name: 'functionDelimiter',
      default: '$EOFCODE$',
      useDefault: true,
      required: false
    }
  ];

  let { cwd, plan, pretty, functionDelimiter } = await prompter.prompt(argv, questions);

  const project = new PgpmPackage(cwd);

  project.ensureModule();

  const info = project.getModuleInfo();
  info.version;

  await writePackage({
    version: info.version,
    extension: true,
    usePlan: plan,
    packageDir: project.modulePath,
    pretty,
    functionDelimiter
  });

  return argv;
};
