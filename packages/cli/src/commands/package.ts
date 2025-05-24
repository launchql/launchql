import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { LaunchQLProject, writePackage } from '@launchql/core';
import chalk from 'chalk';

export default async (
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  const questions: Question[] = [
    {
      type: 'confirm',
      name: 'plan',
      default: true,
      useDefault: true,
      required: true
    }
  ];

  let { cwd, plan } = await prompter.prompt(argv, questions);

  const project = new LaunchQLProject(cwd);

  project.ensureModule();

  const info = project.getModuleInfo();
  info.version

  await writePackage({
    version: info.version,
    extension: true,
    usePlan: plan,
    packageDir: project.modulePath
  });

  return argv;
};
