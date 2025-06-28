import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { LaunchQLProject } from '@launchql/core';
import { Logger } from '@launchql/logger';

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

  const project = new LaunchQLProject(cwd);

  if (!project.isInModule()) {
    throw new Error('This command must be run inside a LaunchQL module.');
  }

  project.writeModulePlan({
    projects: true
  })
  
  return argv;
};
