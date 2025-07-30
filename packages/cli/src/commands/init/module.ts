import { LaunchQLPackage, sluggify } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { errors, getGitConfigInfo } from '@launchql/types';
import { Inquirerer, OptionValue, Question } from 'inquirerer';

const log = new Logger('module-init');

export default async function runModuleSetup(
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer
) {
  const { email, username } = getGitConfigInfo();
  const { cwd = process.cwd() } = argv;

  const project = new LaunchQLPackage(cwd);

  if (!project.workspacePath) {
    log.error('Not inside a LaunchQL workspace.');
    throw errors.NOT_IN_WORKSPACE({});
  }

  if (!project.isInsideAllowedDirs(cwd) && !project.isInWorkspace()) {
    log.error('You must be inside one of the workspace packages.');
    throw errors.NOT_IN_WORKSPACE_MODULE({});
  }

  const availExtensions = project.getAvailableModules();

  const moduleQuestions: Question[] = [
    {
      name: 'MODULENAME',
      message: 'Enter the module name',
      required: true,
      type: 'text',
    },
    {
      name: 'extensions',
      message: 'Which extensions?',
      options: availExtensions,
      type: 'checkbox',
      allowCustomOptions: true,
      required: true,
    },
  ];

  const answers = await prompter.prompt(argv, moduleQuestions);
  const modName = sluggify(answers.MODULENAME);

  const extensions = answers.extensions
    .filter((opt: OptionValue) => opt.selected)
    .map((opt: OptionValue) => opt.name);

  project.initModule({
    ...argv,
    ...answers,
    name: modName,
    // @ts-ignore
    USERFULLNAME: username,
    USEREMAIL: email,
    extensions
  });

  log.success(`Initialized module: ${modName}`);
  return { ...argv, ...answers };
}
