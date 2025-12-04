import { DEFAULT_TEMPLATE_REPO, DEFAULT_TEMPLATE_TOOL_NAME, LaunchQLPackage, sluggify } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { errors, getGitConfigInfo } from '@launchql/types';
import { Inquirerer, OptionValue, Question } from 'inquirerer';

const log = new Logger('module-init');

export default async function runModuleSetup(
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer
) {
  let { email, username } = getGitConfigInfo();
  const { cwd = process.cwd() } = argv;

  const project = new LaunchQLPackage(cwd);

  if (!project.workspacePath) {
    log.error('Not inside a LaunchQL workspace.');
    throw errors.NOT_IN_WORKSPACE({});
  }

  if (!project.isInsideAllowedDirs(cwd) && !project.isInWorkspace() && !project.isParentOfAllowedDirs(cwd)) {
    log.error('You must be inside the workspace root or a parent directory of modules (like packages/).');
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

  if (!username || !email) {
    const identityQuestions: Question[] = [];

    if (!username) {
      identityQuestions.push({
        name: 'fullName',
        message: 'Enter your full name',
        required: true,
        type: 'text'
      });
    }

    if (!email) {
      identityQuestions.push({
        name: 'userEmail',
        message: 'Enter your email address',
        required: true,
        type: 'text'
      });
    }

    if (identityQuestions.length > 0) {
      const identityAnswers = await prompter.prompt(argv, identityQuestions);
      username = username || (identityAnswers as any).fullName;
      email = email || (identityAnswers as any).userEmail;
    }
  }

  const extensions = answers.extensions
    .filter((opt: OptionValue) => opt.selected)
    .map((opt: OptionValue) => opt.name);

  const templateRepo = (argv.repo as string) ?? DEFAULT_TEMPLATE_REPO;
  const templatePath = argv.templatePath as string | undefined;

  const templateAnswers = {
    ...argv,
    ...answers,
    USERFULLNAME: username,
    USEREMAIL: email,
    username,
    email,
    moduleName: modName,
    MODULEDESC: answers.description || modName,
    moduleDesc: answers.description || modName,
    fullName: username || email || 'LaunchQL User',
    repoName: (argv as any).repoName || modName,
    access: (argv as any).access || 'public',
    license: (argv as any).license || 'MIT'
  };

  await project.initModule({
    name: modName,
    description: answers.description || modName,
    author: username || email || modName,
    extensions,
    templateRepo,
    templatePath,
    branch: argv.fromBranch as string | undefined,
    toolName: DEFAULT_TEMPLATE_TOOL_NAME,
    answers: templateAnswers,
    noTty: Boolean((argv as any).noTty || argv['no-tty'] || process.env.CI === 'true')
  });

  log.success(`Initialized module: ${modName}`);
  return { ...argv, ...answers };
}
