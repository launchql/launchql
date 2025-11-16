import { sluggify } from '@launchql/core';
import { Logger } from '@launchql/logger';
// @ts-ignore - TypeScript module resolution issue with @launchql/templatizer
import {
  loadTemplates,
  resolveTemplateDirectory,
  type TemplateSource,
  workspaceTemplate,
  writeRenderedTemplates,
  loadTemplateQuestions,
  extractTemplateVariables,
  computeMissingVariables,
  convertToInquirerQuestions
} from '@launchql/templatizer';
import { getGitConfigInfo } from '@launchql/types';
import { mkdirSync } from 'fs';
import { Inquirerer, Question } from 'inquirerer';
import path from 'path';

const log = new Logger('workspace-init');

export default async function runWorkspaceSetup(
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer
) {
  const { email, username } = getGitConfigInfo();

  const workspaceQuestions: Question[] = [
    {
      name: 'name',
      message: 'Enter workspace name',
      required: true,
      type: 'text',
    }
  ];

  // Determine template source and get template directory
  let templates = workspaceTemplate;
  let templateDir: string | null = null;
  let cleanup: (() => void) | null = null;
  
  if (argv.repo) {
    const source: TemplateSource = {
      type: 'github',
      path: argv.repo as string,
      branch: argv.fromBranch as string
    };
    log.info(`Loading templates from GitHub repository: ${argv.repo}`);
    const result = resolveTemplateDirectory(source, 'workspace');
    templateDir = result.templateDir;
    cleanup = result.cleanup;
    const compiledTemplates = loadTemplates(source, 'workspace');
    templates = compiledTemplates.map((t: any) => t.render);
  } else if (argv.templatePath) {
    const source: TemplateSource = {
      type: 'local',
      path: argv.templatePath as string
    };
    log.info(`Loading templates from local path: ${argv.templatePath}`);
    const result = resolveTemplateDirectory(source, 'workspace');
    templateDir = result.templateDir;
    cleanup = result.cleanup;
    const compiledTemplates = loadTemplates(source, 'workspace');
    templates = compiledTemplates.map((t: any) => t.render);
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

  const existingNames = new Set(workspaceQuestions.map(q => q.name));
  const mergedQuestions = [
    ...workspaceQuestions,
    ...additionalQuestions.filter(q => !existingNames.has(q.name))
  ];

  const answers = await prompter.prompt(argv, mergedQuestions);
  const { cwd } = argv;
  const targetPath = path.join(cwd!, sluggify(answers.name));

  mkdirSync(targetPath, { recursive: true });
  log.success(`Created workspace directory: ${targetPath}`);

  const variables = {
    ...argv,
    ...answers,
    USERFULLNAME: username,
    USEREMAIL: email,
    MODULENAME: answers.name // Alias for compatibility
  };

  if (argv.strict && templateDir) {
    try {
      const requiredVars = extractTemplateVariables(templateDir);
      const missingVars = computeMissingVariables(requiredVars, variables);
      
      if (missingVars.size > 0) {
        log.error(`Missing required variables: ${Array.from(missingVars).join(', ')}`);
        log.error('Use --no-strict to allow prompting for missing variables');
        process.exit(1);
      }
    } catch (err) {
      log.warn('Failed to validate template variables:', err);
    }
  }

  writeRenderedTemplates(templates, targetPath, variables);
  log.success('Workspace templates rendered.');

  if (cleanup) {
    try {
      cleanup();
    } catch (err) {
      log.warn('Failed to cleanup temporary files:', err);
    }
  }

  return { ...argv, ...answers, cwd: targetPath };
}

