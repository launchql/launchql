import { LaunchQLPackage } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';

const log = new Logger('plan');

const planUsageText = `
LaunchQL Plan Command:

  lql plan [OPTIONS]

  Generate module deployment plans.

Options:
  --help, -h              Show this help message
  --packages              Include packages in plan (default: true)
  --cwd <directory>       Working directory (default: current directory)

Examples:
  lql plan                Generate deployment plan for current module
`;

export default async (
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  // Show usage if explicitly requested
  if (argv.help || argv.h) {
    console.log(planUsageText);
    process.exit(0);
  }
  const questions: Question[] = [
    // optionally add CLI prompt questions here later
  ];

  let { cwd } = await prompter.prompt(argv, questions);

  if (!cwd) {
    cwd = process.cwd();
    log.info(`Using current directory: ${cwd}`);
  }

  const pkg = new LaunchQLPackage(cwd);

  if (!pkg.isInModule()) {
    throw new Error('This command must be run inside a LaunchQL module.');
  }

  pkg.writeModulePlan({
    packages: true
  });
  
  return argv;
};
