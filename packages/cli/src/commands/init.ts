import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import chalk from 'chalk';
import * as mkdirp from 'mkdirp';
import path from 'path';
import { 
  writeRenderedTemplates,
  moduleTemplate,
  workspaceTemplate
} from '@launchql/templatizer';
import { getWorkspacePath, sluggify } from '@launchql/migrate';
import { exec } from 'shelljs';

export default async (
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  return handlePromptFlow(argv, prompter);
};

async function handlePromptFlow(argv: Partial<Record<string, any>>, prompter: Inquirerer) {
  const { workspace } = argv;

  switch (workspace) {
    case true:
      return runWorkspaceSetup(argv, prompter);
    case false:
    default:
      return runModuleSetup(argv, prompter);
  }
}

async function runWorkspaceSetup(argv: Partial<Record<string, any>>, prompter: Inquirerer) {
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

  mkdirp.sync(targetPath);
  console.log(chalk.green(`Created workspace directory: ${targetPath}`));

  writeRenderedTemplates(workspaceTemplate, targetPath, { ...argv, ...answers });
  return { ...argv, ...answers, cwd: targetPath };
}

async function runModuleSetup(argv: Partial<Record<string, any>>, prompter: Inquirerer) {
  const username = exec('git config --global user.name', { silent: true }).trim();
  const email = exec('git config --global user.email', { silent: true }).trim();
  const { cwd } = argv;

  const workspacePath = await getWorkspacePath(cwd);
  const isAtWorkspaceRoot = workspacePath === cwd;

  const moduleQuestions: Question[] = [
    {
      name: 'USERFULLNAME',
      message: 'Enter author full name',
      required: true,
      default: username,
      useDefault: true,
      type: 'text',
    },
    {
      name: 'USEREMAIL',
      message: 'Enter author email',
      required: true,
      default: email,
      useDefault: true,
      type: 'text',
    },
    {
      name: 'MODULENAME',
      message: 'Enter the module name',
      required: true,
      type: 'text',
    },
    {
      name: 'REPONAME',
      message: 'Enter the repository name',
      required: true,
      type: 'text',
    },
    {
      name: 'USERNAME',
      message: 'Enter your GitHub username',
      required: true,
      type: 'text',
    },
    {
      name: 'ACCESS',
      message: 'Module access?',
      required: true,
      type: 'autocomplete',
      options: ['public', 'restricted'],
    }
  ];

  const answers = await prompter.prompt(argv, moduleQuestions);
  const modName = sluggify(answers.MODULENAME);
  let targetPath: string;

  if (isAtWorkspaceRoot) {
    const packagesDir = path.join(cwd!, 'packages');
    mkdirp.sync(packagesDir);
    targetPath = path.join(packagesDir, modName);
    mkdirp.sync(targetPath);
    console.log(chalk.green(`Created module in workspace packages/: ${targetPath}`));
  } else {
    targetPath = path.join(cwd!, modName);
    mkdirp.sync(targetPath);
    console.log(chalk.green(`Created module: ${targetPath}`));
  }

  writeRenderedTemplates(moduleTemplate, targetPath, { ...argv, ...answers });
  return { ...argv, ...answers, cwd: targetPath };
}
