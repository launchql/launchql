import { sluggify } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { mkdirSync } from 'fs';
import { Inquirerer, Question } from 'inquirerer';
import path from 'path';

import { DEFAULT_TEMPLATE_URL, runCreateGenApp } from './create-gen-app';

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
  const cwd = argv.cwd ?? process.cwd();
  const targetPath = path.join(cwd, sluggify(answers.name));

  mkdirSync(targetPath, { recursive: true });
  log.success(`Created workspace directory: ${targetPath}`);

  const repo = (argv.repo as string) ?? DEFAULT_TEMPLATE_URL;
  const branch = (argv.fromBranch as string) ?? (argv['from-branch'] as string);
  const fromPath = (argv.templatePath as string) ?? (argv['template-path'] as string) ?? 'workspace';

  await runCreateGenApp({
    templateUrl: repo,
    branch,
    fromPath,
    outputDir: targetPath,
    answers: {
      '____moduleName____': answers.name,
      ...(argv.answers || {})
    },
    noTty: Boolean(argv['no-tty'] ?? argv.noTty)
  });
  log.success('Workspace templates rendered.');

  return { ...argv, ...answers, cwd: targetPath };
}
