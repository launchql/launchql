import { LaunchQLPackage, sluggify } from '@launchql/core';
import { Logger } from '@launchql/logger';
// @ts-ignore - TypeScript module resolution issue with @launchql/templatizer
import {
  type TemplateSource,
  resolveTemplateDirectory,
  loadTemplateQuestions,
  extractTemplateVariables,
  computeMissingVariables,
  convertToInquirerQuestions
} from '@launchql/templatizer';
import { errors, getGitConfigInfo } from '@launchql/types';
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

  let templateSource: TemplateSource | undefined;
  let templateDir: string | null = null;
  let cleanup: (() => void) | null = null;
  
  if (argv.repo) {
    templateSource = {
      type: 'github',
      path: argv.repo as string,
      branch: argv.fromBranch as string
    };
    log.info(`Loading templates from GitHub repository: ${argv.repo}`);
    const result = resolveTemplateDirectory(templateSource, 'module');
    templateDir = result.templateDir;
    cleanup = result.cleanup;
  } else if (argv.templatePath) {
    templateSource = {
      type: 'local',
      path: argv.templatePath as string
    };
    log.info(`Loading templates from local path: ${argv.templatePath}`);
    const result = resolveTemplateDirectory(templateSource, 'module');
    templateDir = result.templateDir;
    cleanup = result.cleanup;
  } else {
    templateDir = path.join(__dirname, '../../../../../boilerplates/module');
  }

  let additionalQuestions: Question[] = [];
  if (templateDir) {
    try {
      const templateQuestions = loadTemplateQuestions(templateDir);
      if (templateQuestions.length > 0) {
        log.info(`Loaded ${templateQuestions.length} questions from template`);
        const context = { ...argv };
        additionalQuestions = convertToInquirerQuestions(templateQuestions, context);
      }
    } catch (err) {
      log.warn('Failed to load template questions:', err);
    }
  }

  const existingNames = new Set(moduleQuestions.map(q => q.name));
  const mergedQuestions = [
    ...moduleQuestions,
    ...additionalQuestions.filter(q => !existingNames.has(q.name))
  ];

  const answers = await prompter.prompt(argv, mergedQuestions);
  const modName = sluggify(answers.MODULENAME);

  const extensions = answers.extensions
    .filter((opt: OptionValue) => opt.selected)
    .map((opt: OptionValue) => opt.name);

  const variables = {
    ...argv,
    ...answers,
    name: modName,
    description: answers.description || `${modName} module`,
    author: answers.author || username,
    USERFULLNAME: username,
    USEREMAIL: email,
    PACKAGE_IDENTIFIER: answers.PACKAGE_IDENTIFIER || modName,
    extensions,
    templateSource
  };

  if (argv.strict && templateDir) {
    try {
      const requiredVars = extractTemplateVariables(templateDir);
      const missingVars = computeMissingVariables(requiredVars, variables);
      
      if (missingVars.size > 0) {
        log.error(`Missing required variables: ${Array.from(missingVars).join(', ')}`);
        log.error('Use --no-strict to allow prompting for missing variables');
        if (cleanup) cleanup();
        process.exit(1);
      }
    } catch (err) {
      log.warn('Failed to validate template variables:', err);
    }
  }

  project.initModule(variables);

  if (cleanup) {
    try {
      cleanup();
    } catch (err) {
      log.warn('Failed to cleanup temporary files:', err);
    }
  }

  log.success(`Initialized module: ${modName}`);
  return { ...argv, ...answers };
}

