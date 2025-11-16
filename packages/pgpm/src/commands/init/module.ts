import { LaunchQLPackage, sluggify } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { errors, getGitConfigInfo } from '@launchql/types';
import { createGen } from 'create-gen-app';
import { Inquirerer, OptionValue, Question } from 'inquirerer';
import path from 'path';

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
      type: 'text'
    },
    {
      name: 'description',
      message: 'Enter module description',
      required: false,
      type: 'text'
    },
    {
      name: 'extensions',
      message: 'Which extensions?',
      options: availExtensions,
      type: 'checkbox',
      allowCustomOptions: true,
      required: true
    },
    {
      name: 'template',
      message: 'Template repository URL (leave empty for default)',
      required: false,
      type: 'text'
    }
  ];

  const answers = await prompter.prompt(argv, moduleQuestions);
  const modName = sluggify(answers.MODULENAME);

  const extensions = answers.extensions
    .filter((opt: OptionValue) => opt.selected)
    .map((opt: OptionValue) => opt.name);

  const templateUrl = answers.template || argv.template;

  if (templateUrl) {
    log.info(`Creating module from template: ${templateUrl}`);

    const targetPath = path.join(cwd, modName);

    try {
      await createGen({
        templateUrl,
        outputDir: targetPath,
        argv: {
          ...argv,
          ...answers,
          MODULENAME: modName,
          MODULE_NAME: modName,
          USERFULLNAME: username,
          USEREMAIL: email,
          DESCRIPTION: answers.description || modName,
          EXTENSIONS: extensions.join(', ')
        },
        noTty: false
      });

      log.success(`Created module from template: ${modName}`);
    } catch (error) {
      log.error(`Failed to create module from template: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  } else {
    await project.initModule({
      ...argv,
      ...answers,
      name: modName,
      description: answers.description || modName,
      author: username || email || 'Unknown',
      extensions
    });

    log.success(`Initialized module: ${modName}`);
  }

  return { ...argv, ...answers };
}
