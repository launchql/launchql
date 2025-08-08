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
  --includePackages              Include packages in plan (default: true)
  --includeTags                  Prefer @tag references for external packages when available (default: true)
  --cwd <directory>              Working directory (default: current directory)

Examples:
  lql plan                                 Generate deployment plan for current module with defaults
  lql plan --includePackages false         Disable including external packages
  lql plan --includeTags false              Do not prefer tags for external packages
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
      name: 'includePackages',
      message: 'Include packages in plan?',
      useDefault: true,
      default: true,
      when: (_a) => typeof argv.includePackages === 'undefined'
    },
    {
      type: 'confirm',
      name: 'includeTags',
      message: 'Prefer @tag references for external packages when available?',
      useDefault: true,
      default: true,
      when: (_a) => typeof argv.includeTags === 'undefined'
    }
  ];

  const { cwd, includePackages, includeTags } = await prompter.prompt(argv, questions);

  const workingDir = cwd || process.cwd();
  if (!cwd) {
    log.info(`Using current directory: ${workingDir}`);
  }

  const pkg = new LaunchQLPackage(workingDir);

  if (!pkg.isInModule()) {
    throw new Error('This command must be run inside a LaunchQL module.');
  }

  const includePackagesFlag = typeof includePackages === 'boolean' ? includePackages : true;
  const includeTagsFlag = typeof includeTags === 'boolean' ? includeTags : true;

  pkg.writeModulePlan({
    includePackages: includePackagesFlag,
    includeTags: includeTagsFlag
  });
  
  return argv;
};
