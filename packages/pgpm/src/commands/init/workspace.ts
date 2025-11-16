import { sluggify } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { getGitConfigInfo } from '@launchql/types';
import { mkdirSync } from 'fs';
import { Inquirerer } from 'inquirerer';
import path from 'path';
import { loadBoilerplate } from '../../utils/boilerplate';
import { copyAndRenderTemplates } from '../../utils/template-renderer';

const log = new Logger('workspace-init');

export default async function runWorkspaceSetup(
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer
) {
  const { email, username } = getGitConfigInfo();

  const boilerplateOptions = {
    repo: argv.repo as string | undefined,
    branch: argv.fromBranch as string | undefined,
    boilerplate: argv.boilerplate as string | undefined,
    templatePath: argv.templatePath as string | undefined
  };

  log.info('Loading boilerplate...');
  const { boilerplatePath, questions, cleanup } = loadBoilerplate('workspace', boilerplateOptions);

  try {
    const answers = await prompter.prompt(argv, questions);
    
    const workspaceName = answers.name ? sluggify(answers.name) : sluggify(answers.WORKSPACENAME || 'new-workspace');
    const { cwd } = argv;
    const targetPath = path.join(cwd!, workspaceName);

    mkdirSync(targetPath, { recursive: true });
    log.success(`Created workspace directory: ${targetPath}`);

    const context: Record<string, any> = {
      ...answers,
      name: workspaceName,
      USERFULLNAME: username,
      USEREMAIL: email
    };

    log.info(`Rendering templates to: ${targetPath}`);
    copyAndRenderTemplates(boilerplatePath, targetPath, context);
    log.success('Workspace templates rendered.');

    return { ...argv, ...answers, cwd: targetPath };
  } finally {
    cleanup();
  }
}

