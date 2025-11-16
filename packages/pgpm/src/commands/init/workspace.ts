import { sluggify } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { createGen } from 'create-gen-app';
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
    },
    {
      name: 'template',
      message: 'Template repository URL (leave empty for default)',
      required: false,
      type: 'text'
    }
  ];

  const answers = await prompter.prompt(argv, workspaceQuestions);
  const { cwd } = argv;
  const targetPath = path.join(cwd!, sluggify(answers.name));

  const templateUrl = answers.template || argv.template || 'launchql/launchql';
  
  log.info(`Creating workspace from template: ${templateUrl}`);

  try {
    await createGen({
      templateUrl,
      outputDir: targetPath,
      argv: {
        ...argv,
        ...answers,
        WORKSPACE_NAME: answers.name,
        PROJECT_NAME: answers.name
      },
      noTty: false
    });

    log.success(`Created workspace directory: ${targetPath}`);
  } catch (error) {
    log.error(`Failed to create workspace: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }

  return { ...argv, ...answers, cwd: targetPath };
}
