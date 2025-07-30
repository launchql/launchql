import { LaunchQLPackage } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';

const log = new Logger('plan');

export default async (
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  const questions: Question[] = [
    // optionally add CLI prompt questions here later
  ];

  let { cwd } = await prompter.prompt(argv, questions);

  if (!cwd) {
    cwd = process.cwd();
    log.info(`Using current directory: ${cwd}`);
  }

  const packageInstance = new LaunchQLPackage(cwd);

  if (!packageInstance.isInModule()) {
    throw new Error('This command must be run inside a LaunchQL module.');
  }

  packageInstance.writeModulePlan({
    packages: true
  });
  
  return argv;
};
