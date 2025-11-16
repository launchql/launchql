import { LaunchQLPackage, sluggify } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { errors, getGitConfigInfo } from '@launchql/types';
import { Inquirerer, OptionValue, Question } from 'inquirerer';
import { loadBoilerplate } from '../../utils/boilerplate';
import { copyAndRenderTemplates } from '../../utils/template-renderer';
import { join } from 'path';

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

  const boilerplateOptions = {
    repo: argv.repo as string | undefined,
    branch: argv.fromBranch as string | undefined,
    boilerplate: argv.boilerplate as string | undefined,
    templatePath: argv.templatePath as string | undefined
  };

  log.info('Loading boilerplate...');
  const { boilerplatePath, questions, cleanup } = loadBoilerplate('module', boilerplateOptions);

  try {
    const availExtensions = project.getAvailableModules();

    const enhancedQuestions = questions.map(q => {
      if (q.name === 'extensions' && !q.options) {
        return {
          ...q,
          options: availExtensions,
          allowCustomOptions: true
        };
      }
      return q;
    });

    const answers = await prompter.prompt(argv, enhancedQuestions);

    const modName = answers.name ? sluggify(answers.name) : sluggify(answers.MODULENAME || 'new-module');

    let extensions: string[] = [];
    if (answers.extensions) {
      extensions = Array.isArray(answers.extensions)
        ? answers.extensions
            .filter((opt: OptionValue | string) => typeof opt === 'string' || opt.selected)
            .map((opt: OptionValue | string) => typeof opt === 'string' ? opt : opt.name)
        : [];
    }

    const context: Record<string, any> = {
      ...answers,
      name: modName,
      USERFULLNAME: username,
      USEREMAIL: email,
      ...(extensions.length > 0 && { extensions: extensions.join(', ') })
    };

    // Determine target path
    const targetPath = project.isInWorkspace() 
      ? join(project.workspacePath!, modName)
      : join(cwd, modName);

    log.info(`Rendering templates to: ${targetPath}`);
    copyAndRenderTemplates(boilerplatePath, targetPath, context);

    project.initModule({
      name: modName,
      extensions,
      skipTemplates: true // Skip template rendering since we already did it
    });

    log.success(`Initialized module: ${modName}`);
    return { ...argv, ...answers, name: modName };
  } finally {
    cleanup();
  }
}

