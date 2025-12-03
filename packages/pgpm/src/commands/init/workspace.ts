import { sluggify } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { getGitConfigInfo } from '@launchql/types';
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
  const { email, username } = getGitConfigInfo();
  const normalizedAnswerOverrides = normalizeAnswers(argv.answers || {});

  const baseAnswers = normalizeAnswers({
    moduleName: answers.name,
    repoName: answers.name,
    fullName: username || answers.name,
    email,
    username,
    license: (argv as any).license || 'MIT'
  });

  await runCreateGenApp({
    templateUrl: repo,
    branch,
    fromPath,
    outputDir: targetPath,
    answers: {
      ...baseAnswers,
      ...normalizedAnswerOverrides
    },
    noTty: Boolean(argv['no-tty'] ?? argv.noTty)
  });
  log.success('Workspace templates rendered.');

  return { ...argv, ...answers, cwd: targetPath };
}

function normalizeAnswers(raw: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};
  Object.entries(raw || {}).forEach(([key, value]) => {
    const cleaned = key.replace(/^_{2,}(.*)_{2,}$/, '$1');
    normalized[key] = value;
    normalized[cleaned] = value;
  });
  return normalized;
}
