import { DEFAULT_TEMPLATE_REPO, DEFAULT_TEMPLATE_TOOL_NAME, scaffoldTemplate, sluggify } from '@pgpmjs/core';
import { Logger } from '@pgpmjs/logger';
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
      type: 'text'
    }
  ];

  const answers = await prompter.prompt(argv, workspaceQuestions);
  const { cwd = process.cwd() } = argv;
  const targetPath = path.join(cwd, sluggify(answers.name));
  // Prevent double-echoed keystrokes by closing our prompter before template prompts.
  prompter.close();

  const templateRepo = (argv.repo as string) ?? DEFAULT_TEMPLATE_REPO;
  // Don't set default templatePath - let scaffoldTemplate use metadata-driven resolution
  const templatePath = argv.templatePath as string | undefined;

  const scaffoldResult = await scaffoldTemplate({
    type: 'workspace',
    outputDir: targetPath,
    templateRepo,
    branch: argv.fromBranch as string | undefined,
    templatePath,
    answers: {
      ...argv,
      ...answers,
      workspaceName: answers.name
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
