import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { LaunchQLProject } from '@launchql/migrate';
import chalk from 'chalk';

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
    console.log(chalk.gray(`Using current directory: ${cwd}`));
  }

  const project = new LaunchQLProject(cwd);
  await project.init();

  if (!project.isInModule()) {
    throw new Error('This command must be run inside a LaunchQL module.');
  }

  const info = project.getModuleInfo();
  const plan = await project.generateModulePlan({
    projects: true
  });

  console.log(info);
  console.log(plan);

  return argv;
};
