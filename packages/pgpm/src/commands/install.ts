import { LaunchQLPackage } from '@launchql/core';
import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';

const installUsageText = `
LaunchQL Install Command:

  pgpm install <package>...

  Install LaunchQL modules into current module.

Arguments:
  package                 One or more package names to install

Options:
  --help, -h              Show this help message
  --cwd <directory>       Working directory (default: current directory)

Examples:
  pgpm install @launchql/base32                    Install single package
  pgpm install @launchql/base32 @launchql/utils   Install multiple packages
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

  const project = new LaunchQLPackage(cwd);

  if (!project.isInModule()) {
    throw new Error('You must run this command inside a LaunchQL module.');
  }

  if (argv._.length === 0) {
    throw new Error('You must provide a package name to install, e.g. `@launchql/base32`');
  }

  await project.installModules(...argv._);

};
