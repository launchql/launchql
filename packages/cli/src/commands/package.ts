import { LaunchQLProject, writePackage } from '@launchql/core';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';

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

  const project = new LaunchQLProject(cwd);

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
