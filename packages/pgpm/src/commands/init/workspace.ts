import { DEFAULT_TEMPLATE_REPO, DEFAULT_TEMPLATE_TOOL_NAME, scaffoldTemplate, sluggify } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { getGitConfigInfo } from '@launchql/types';
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
  const { cwd = process.cwd() } = argv;
  const targetPath = path.join(cwd, sluggify(answers.name));

  const { email, username } = getGitConfigInfo();

  const templateRepo = (argv.repo as string) ?? DEFAULT_TEMPLATE_REPO;
  const templatePath = (argv.templatePath as string | undefined) ?? 'workspace';

  const scaffoldResult = await scaffoldTemplate({
    type: 'workspace',
    outputDir: targetPath,
    templateRepo,
    branch: argv.fromBranch as string | undefined,
    templatePath,
    answers: {
      ...argv,
      ...answers,
      workspaceName: answers.name,
      fullName: username || email || 'LaunchQL User',
      email: email || 'user@example.com',
      moduleName: 'starter-module',
      username: username || 'launchql-user'
    },
    toolName: DEFAULT_TEMPLATE_TOOL_NAME,
    noTty: Boolean((argv as any).noTty || argv['no-tty'] || process.env.CI === 'true'),
    cwd
  });

  const cacheMessage = scaffoldResult.cacheUsed
    ? `Using cached templates from ${scaffoldResult.templateDir}`
    : `Fetched templates into ${scaffoldResult.templateDir}`;
  log.success(cacheMessage);
  log.success('Workspace templates rendered.');

  return { ...argv, ...answers, cwd: targetPath };
}
