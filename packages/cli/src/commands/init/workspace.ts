import { sluggify } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { workspaceTemplate,writeRenderedTemplates } from '@launchql/templatizer';
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

  writeRenderedTemplates(workspaceTemplate, targetPath, { ...argv, ...answers });
  log.success('Workspace templates rendered.');

  return { ...argv, ...answers, cwd: targetPath };
}
