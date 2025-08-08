import { LaunchQLPackage } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';

const log = new Logger('plan');

const planUsageText = `
LaunchQL Plan Command:

  lql plan [OPTIONS]

  Generate module deployment plans.

Options:
  --help, -h                     Show this help message
  --packages                     Include packages in plan (default: true)
  --preferPackageTags            Prefer @tag references for external packages when available (default: true)
  --cwd <directory>              Working directory (default: current directory)

Examples:
  lql plan                                 Generate deployment plan for current module with defaults
  lql plan --packages false                Disable including external packages
  lql plan --preferPackageTags false       Do not prefer tags for external packages
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
    {
      type: 'confirm',
      name: 'packages',
      message: 'Include packages in plan?',
      useDefault: true,
      default: true,
      when: (_a) => typeof argv.packages === 'undefined'
    },
    {
      type: 'confirm',
      name: 'preferPackageTags',
      message: 'Prefer @tag references for external packages when available?',
      useDefault: true,
      default: true,
      when: (_a) => typeof argv.preferPackageTags === 'undefined'
    },
    {
      type: 'text',
      name: 'cwd',
      message: 'Working directory',
      useDefault: true,
      default: process.cwd(),
      when: (_a) => typeof argv.cwd === 'undefined'
    }
  ];

  const { cwd, packages, preferPackageTags } = await prompter.prompt(argv, questions);

  const workingDir = cwd || process.cwd();
  if (!cwd) {
    log.info(`Using current directory: ${workingDir}`);
  }

  const pkg = new LaunchQLPackage(workingDir);

  if (!pkg.isInModule()) {
    throw new Error('This command must be run inside a LaunchQL module.');
  }

  const includePackages = typeof packages === 'boolean' ? packages : true;
  const preferTags = typeof preferPackageTags === 'boolean' ? preferPackageTags : true;

  pkg.writeModulePlan({
    packages: includePackages,
    preferPackageTags: preferTags,
    tags: 'preserve'
  });
  
  return argv;
};
