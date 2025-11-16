import { sluggify } from '@launchql/core';
import { Logger } from '@launchql/logger';
// @ts-ignore - TypeScript module resolution issue with @launchql/templatizer
import { loadTemplates, type TemplateSource,workspaceTemplate, writeRenderedTemplates } from '@launchql/templatizer';
import { getGitConfigInfo } from '@launchql/types';
import { mkdirSync } from 'fs';
import { Inquirerer, Question } from 'inquirerer';
import path from 'path';
import fs from 'fs';

const log = new Logger('workspace-init');

export default async function runWorkspaceSetup(
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer
) {
  const { email, username } = getGitConfigInfo();
  const { cwd } = argv;

  const templateDir = argv.templatePath 
    ? argv.templatePath 
    : path.join(__dirname, '../../../../boilerplates/workspace');

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
  
  const workspaceName = argv.name || Object.values(answers).find(v => typeof v === 'string' && v.length > 0) as string || path.basename(cwd!);
  const targetPath = path.join(cwd!, sluggify(workspaceName));

  mkdirSync(targetPath, { recursive: true });
  log.success(`Created workspace directory: ${targetPath}`);

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

