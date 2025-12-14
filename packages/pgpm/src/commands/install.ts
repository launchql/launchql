import { PgpmPackage } from '@pgpmjs/core';
import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';

const installUsageText = `
Install Command:

  pgpm install <package>...

  Install pgpm modules into current module.

Arguments:
  package                 One or more package names to install

Options:
  --help, -h              Show this help message
  --cwd <directory>       Working directory (default: current directory)

Examples:
  pgpm install @pgpm/base32                    Install single package
  pgpm install @pgpm/base32 @pgpm/utils   Install multiple packages
`;

export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  // Show usage if explicitly requested
  if (argv.help || argv.h) {
    console.log(installUsageText);
    process.exit(0);
  }
  const { cwd = process.cwd() } = argv;

  const project = new PgpmPackage(cwd);

  if (!project.isInModule()) {
    throw new Error('You must run this command inside a PGPM module.');
  }

  if (argv._.length === 0) {
    throw new Error('You must provide a package name to install, e.g. `@pgpm/base32`');
  }

  await project.installModules(...argv._);

};
