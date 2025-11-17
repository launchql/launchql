import { sluggify } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { getGitConfigInfo } from '@launchql/types';
// @ts-ignore - TypeScript module resolution issue with @launchql/templatizer
import { loadTemplates, type TemplateSource,workspaceTemplate, writeRenderedTemplates } from '@launchql/templatizer';
import { mkdirSync } from 'fs';
import { Inquirerer, Question } from 'inquirerer';
import path from 'path';

const log = new Logger('workspace-init');
const LICENSE_CHOICES = ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC', 'Unlicense'] as const;
const DEFAULT_LICENSE = LICENSE_CHOICES[0];

interface GitDefaults {
  username?: string;
  email?: string;
}

function getAuthorDefaults(): GitDefaults {
  try {
    const { username, email } = getGitConfigInfo();
    return { username, email };
  } catch (error) {
    log.warn('Unable to read git config for defaults. Falling back to manual input.');
    return {};
  }
}

export default async function runWorkspaceSetup(
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer
) {
  const { username: gitUsername, email: gitEmail } = getAuthorDefaults();
  const defaultModuleName = argv.MODULENAME ?? (argv.name ? sluggify(String(argv.name)) : 'my-module');

  const workspaceQuestions: Question[] = [
    {
      name: 'USERFULLNAME',
      message: 'Enter author full name',
      required: true,
      type: 'text',
      default: argv.USERFULLNAME ?? gitUsername,
      useDefault: Boolean(argv.USERFULLNAME ?? gitUsername)
    },
    {
      name: 'USEREMAIL',
      message: 'Enter author email',
      required: true,
      type: 'text',
      default: argv.USEREMAIL ?? gitEmail,
      useDefault: Boolean(argv.USEREMAIL ?? gitEmail)
    },
    {
      name: 'name',
      message: 'Enter workspace name',
      required: true,
      type: 'text',
    },
    {
      name: 'MODULENAME',
      message: 'Enter the initial module name',
      required: true,
      type: 'text',
      default: defaultModuleName,
      useDefault: Boolean(defaultModuleName)
    },
    {
      name: 'USERNAME',
      message: 'Enter your github username',
      required: true,
      type: 'text',
      default: argv.USERNAME ?? gitUsername,
      useDefault: Boolean(argv.USERNAME ?? gitUsername)
    },
    {
      name: 'LICENSE',
      message: 'Choose a license',
      required: true,
      type: 'autocomplete',
      options: LICENSE_CHOICES as unknown as string[],
      default: argv.LICENSE ?? DEFAULT_LICENSE,
      useDefault: true
    }
  ];

  const answers = await prompter.prompt(argv, workspaceQuestions);
  const { cwd } = argv;
  const workspaceName = answers.name;
  const targetPath = path.join(cwd!, sluggify(workspaceName));
  const resolvedModuleName = sluggify(answers.MODULENAME || workspaceName || 'my-module');

  const finalAnswers = {
    ...answers,
    USERFULLNAME: answers.USERFULLNAME || gitUsername,
    USEREMAIL: answers.USEREMAIL || gitEmail,
    USERNAME: answers.USERNAME || gitUsername,
    LICENSE: answers.LICENSE || DEFAULT_LICENSE,
    MODULENAME: resolvedModuleName
  };

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

  writeRenderedTemplates(templates, targetPath, { ...argv, ...finalAnswers });
  log.success('Workspace templates rendered.');

  return { ...argv, ...finalAnswers, cwd: targetPath };
}

