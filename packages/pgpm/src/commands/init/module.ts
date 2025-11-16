import { LaunchQLPackage, sluggify } from '@launchql/core';
import { Logger } from '@launchql/logger';
// @ts-ignore - TypeScript module resolution issue with @launchql/templatizer
import { type TemplateSource } from '@launchql/templatizer';
import { errors, getGitConfigInfo } from '@launchql/types';
import { Inquirerer, OptionValue, Question } from 'inquirerer';
import fs from 'fs';
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
    log.error('Not inside a module');
    throw errors.NOT_IN_WORKSPACE({});
  }

  if (!project.isInsideAllowedDirs(cwd) && !project.isInWorkspace() && !project.isParentOfAllowedDirs(cwd)) {
    log.error('You must run this command inside a LaunchQL module.');
    throw errors.NOT_IN_WORKSPACE_MODULE({});
  }

  const availExtensions = project.getAvailableModules();

  const templateDir = argv.templatePath 
    ? argv.templatePath 
    : path.join(__dirname, '../../../../boilerplates/module');

  let templateQuestions: Question[] = [];
  const questionsPath = path.join(templateDir, '.questions.json');
  if (fs.existsSync(questionsPath)) {
    try {
      const content = fs.readFileSync(questionsPath, 'utf8');
      const questions = JSON.parse(content);
      if (Array.isArray(questions)) {
        templateQuestions = questions.map(q => ({
          ...q,
          name: q.name.replace(/^__/, '').replace(/__$/, '')
        }));
      }
    } catch (error) {
    }
  }
  
  templateQuestions.push({
    name: 'extensions',
    message: 'Which extensions?',
    options: availExtensions,
    type: 'checkbox',
    allowCustomOptions: true,
    required: true,
  });

  const argsWithDefaults: Record<string, any> = { ...argv };
  templateQuestions.forEach(q => {
    if (!argsWithDefaults[q.name]) {
      const nameUpper = q.name.toUpperCase();
      if (nameUpper.includes('EMAIL')) {
        argsWithDefaults[q.name] = email;
      } else if (nameUpper.includes('FULLNAME') || nameUpper.includes('AUTHOR')) {
        argsWithDefaults[q.name] = username;
      }
    }
  });

  const answers = await prompter.prompt(argsWithDefaults, templateQuestions);
  
  const moduleName = argv.name || Object.values(answers).find(v => typeof v === 'string' && v.length > 0) as string || path.basename(cwd);
  const modName = sluggify(moduleName);

  let extensions: string[] = [];
  if (Array.isArray(answers.extensions)) {
    if (answers.extensions.length > 0 && typeof answers.extensions[0] === 'string') {
      extensions = answers.extensions;
    } else {
      extensions = answers.extensions
        .filter((opt: OptionValue) => opt.selected)
        .map((opt: OptionValue) => opt.name);
    }
  }

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

  let description = '';
  let author = '';
  
  for (const [key, value] of Object.entries(answers)) {
    if (typeof value === 'string') {
      const keyUpper = key.toUpperCase();
      if (!description && keyUpper.includes('DESC')) {
        description = value;
      }
      if (!author && (keyUpper.includes('FULLNAME') || keyUpper.includes('AUTHOR'))) {
        author = value;
      }
    }
  }

  project.initModule({
    name: modName,
    description: description || `${modName} module`,
    author: author || '',
    extensions,
    templateSource,
    ...answers
  } as any);

  log.success(`Initialized module: ${modName}`);
  return { ...argv, ...answers };
}

