import { LaunchQLPackage, sluggify } from '@launchql/core';
import { Logger } from '@launchql/logger';
// @ts-ignore - TypeScript module resolution issue with @launchql/templatizer
import { type TemplateSource } from '@launchql/templatizer';
import { errors, getGitConfigInfo } from '@launchql/types';
import { Inquirerer, OptionValue, Question } from 'inquirerer';

const log = new Logger('module-init');
const LICENSE_CHOICES = ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC', 'Unlicense'] as const;
const DEFAULT_LICENSE = LICENSE_CHOICES[0];
const ACCESS_CHOICES = ['public', 'restricted'] as const;
const DEFAULT_ACCESS = ACCESS_CHOICES[1];

interface GitDefaults {
  username?: string;
  email?: string;
}

function getAuthorDefaults(): GitDefaults {
  try {
    const { username, email } = getGitConfigInfo();
    return { username, email };
  } catch (error) {
    log.warn('Unable to read git config for defaults. Falling back to manual input.');
    return {};
  }
}

export default async function runModuleSetup(
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer
) {
  const { username: gitUsername, email: gitEmail } = getAuthorDefaults();
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

  const defaultModuleName = argv.MODULENAME ?? argv.name ?? 'my-module';
  const hasCliFullName = typeof argv.USERFULLNAME === 'string' && argv.USERFULLNAME.length > 0;
  const hasCliEmail = typeof argv.USEREMAIL === 'string' && argv.USEREMAIL.length > 0;
  const hasCliModuleName = typeof argv.MODULENAME === 'string' && argv.MODULENAME.length > 0;
  const hasCliModuleDesc = typeof argv.MODULEDESC === 'string' && argv.MODULEDESC.length > 0;
  const hasCliRepoName = typeof argv.REPONAME === 'string' && argv.REPONAME.length > 0;
  const hasCliGithub = typeof argv.USERNAME === 'string' && argv.USERNAME.length > 0;
  const hasCliAccess = typeof argv.ACCESS === 'string' && argv.ACCESS.length > 0;
  const hasCliLicense = typeof argv.LICENSE === 'string' && argv.LICENSE.length > 0;

  const moduleQuestions: Question[] = [
    {
      name: 'USERFULLNAME',
      message: 'Enter author full name',
      required: true,
      type: 'text',
      default: argv.USERFULLNAME ?? gitUsername,
      useDefault: hasCliFullName
    },
    {
      name: 'USEREMAIL',
      message: 'Enter author email',
      required: true,
      type: 'text',
      default: argv.USEREMAIL ?? gitEmail,
      useDefault: hasCliEmail
    },
    {
      name: 'MODULENAME',
      message: 'Enter the module name',
      required: true,
      type: 'text',
      default: defaultModuleName,
      useDefault: hasCliModuleName
    },
    {
      name: 'MODULEDESC',
      message: 'Enter the module description',
      required: true,
      type: 'text',
      default: argv.MODULEDESC,
      useDefault: hasCliModuleDesc
    },
    {
      name: 'REPONAME',
      message: 'Enter the repository name',
      required: true,
      type: 'text',
      default: argv.REPONAME ?? defaultModuleName,
      useDefault: hasCliRepoName
    },
    {
      name: 'USERNAME',
      message: 'Enter your github username',
      required: true,
      type: 'text',
      default: argv.USERNAME ?? gitUsername,
      useDefault: hasCliGithub
    },
    {
      name: 'ACCESS',
      message: 'Module access?',
      required: true,
      type: 'autocomplete',
      options: ACCESS_CHOICES as unknown as string[],
      default: argv.ACCESS ?? DEFAULT_ACCESS,
      useDefault: hasCliAccess
    },
    {
      name: 'LICENSE',
      message: 'Choose a license',
      required: true,
      type: 'autocomplete',
      options: LICENSE_CHOICES as unknown as string[],
      default: argv.LICENSE ?? DEFAULT_LICENSE,
      useDefault: hasCliLicense
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

  // Determine template source
  let templateSource: TemplateSource | undefined;
  
  if (argv.repo) {
    templateSource = {
      type: 'github',
      path: argv.repo as string,
      branch: argv.fromBranch as string
    };
    log.info(`Loading templates from GitHub repository: ${argv.repo}`);
  } else if (argv.templatePath) {
    templateSource = {
      type: 'local',
      path: argv.templatePath as string
    };
    log.info(`Loading templates from local path: ${argv.templatePath}`);
  }

  const resolvedRepoName = sluggify(answers.REPONAME || modName);
  const finalAnswers = {
    ...answers,
    USERFULLNAME: answers.USERFULLNAME || gitUsername,
    USEREMAIL: answers.USEREMAIL || gitEmail,
    MODULENAME: modName,
    MODULEDESC:
      answers.MODULEDESC ||
      argv.MODULEDESC ||
      `${modName} description`,
    REPONAME: resolvedRepoName,
    USERNAME: answers.USERNAME || gitUsername,
    ACCESS: answers.ACCESS || DEFAULT_ACCESS,
    LICENSE: answers.LICENSE || DEFAULT_LICENSE
  };

  project.initModule({
    ...argv,
    ...finalAnswers,
    name: modName,
    description: finalAnswers.MODULEDESC,
    author: finalAnswers.USERFULLNAME || gitUsername || 'Unknown Author',
    extensions,
    templateSource
  });

  log.success(`Initialized module: ${modName}`);
  return { ...argv, ...finalAnswers };
}

