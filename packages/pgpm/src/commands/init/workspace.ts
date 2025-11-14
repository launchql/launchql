import { sluggify } from '@launchql/core';
import { Logger } from '@launchql/logger';
// @ts-ignore - TypeScript module resolution issue with @launchql/templatizer
import { loadTemplates, type TemplateSource,workspaceTemplate, writeRenderedTemplates } from '@launchql/templatizer';
import { mkdirSync } from 'fs';
import { Inquirerer, Question } from 'inquirerer';
import path from 'path';

const log = new Logger('workspace-init');

export default async function runWorkspaceSetup(
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer
) {
  const workspaceQuestions: Question[] = [
    {
      name: 'name',
      message: 'Enter workspace name',
      required: true,
      type: 'text',
    }
  ];

  const answers = await prompter.prompt(argv, workspaceQuestions);
  const { cwd } = argv;
  const targetPath = path.join(cwd!, sluggify(answers.name));

  mkdirSync(targetPath, { recursive: true });
  log.success(`Created workspace directory: ${targetPath}`);

  // Determine template source
  let templates = workspaceTemplate;
  
  if (argv.repo) {
    const source: TemplateSource = {
      type: 'github',
      path: argv.repo as string,
      branch: argv.fromBranch as string
    };
    log.info(`Loading templates from GitHub repository: ${argv.repo}`);
    const compiledTemplates = loadTemplates(source, 'workspace');
    templates = compiledTemplates.map((t: any) => t.render);
  } else if (argv.templatePath) {
    const source: TemplateSource = {
      type: 'local',
      path: argv.templatePath as string
    };
    log.info(`Loading templates from local path: ${argv.templatePath}`);
    const compiledTemplates = loadTemplates(source, 'workspace');
    templates = compiledTemplates.map((t: any) => t.render);
  }

  writeRenderedTemplates(templates, targetPath, { ...argv, ...answers });
  log.success('Workspace templates rendered.');

  return { ...argv, ...answers, cwd: targetPath };
}

