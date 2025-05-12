import { Inquirerer, Question } from 'inquirerer';
import chalk from 'chalk';
import * as mkdirp from 'mkdirp';
import path from 'path';
import fs, { writeFileSync } from 'fs';
import glob from 'glob';
import { 
  writeRenderedTemplates,
  moduleTemplate
} from '@launchql/templatizer';
import { getAvailableExtensions, getExtensionInfo, getWorkspacePath, listModules, makePlan, sluggify, writeExtensionControlFile, writeExtensionMakefile } from '@launchql/migrate';
import { exec } from 'shelljs';

function isInsideAllowedDirs(cwd: string, allowedDirs: string[]): boolean {
  const resolvedCwd = path.resolve(cwd);
  return allowedDirs.some(dir => resolvedCwd.startsWith(dir));
}

function loadAllowedDirs(workspacePath: string): string[] {
  const configPath = path.join(workspacePath, 'launchql.json');
  if (!fs.existsSync(configPath)) {
    throw new Error(`Missing launchql.json at workspace root: ${configPath}`);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const globs: string[] = config?.packages ?? [];

  const dirs = globs.flatMap(pattern => glob.sync(path.join(workspacePath, pattern)));
  return dirs.map(dir => path.resolve(dir));
}

export default async function runModuleSetup(argv: Partial<Record<string, any>>, prompter: Inquirerer) {
  const username = exec('git config --global user.name', { silent: true }).trim();
  const email = exec('git config --global user.email', { silent: true }).trim();
  const { cwd = process.cwd() } = argv;

  const workspacePath = await getWorkspacePath(cwd);
  const isAtWorkspaceRoot = path.resolve(workspacePath) === path.resolve(cwd);

  if (!isAtWorkspaceRoot) {
    const allowedDirs = loadAllowedDirs(workspacePath);
    if (!isInsideAllowedDirs(cwd, allowedDirs)) {
      console.error(chalk.red(`Error: You must be inside one of the workspace packages: ${allowedDirs.join(', ')}`));
      process.exit(1);
    }
  }

  
  const moduleMap = await listModules(workspacePath);
  const availExtensions = await getAvailableExtensions(moduleMap)


  const moduleQuestions: Question[] = [
    // {
    //   name: 'USERFULLNAME',
    //   message: 'Enter author full name',
    //   required: true,
    //   default: username,
    //   useDefault: true,
    //   type: 'text',
    // },
    // {
    //   name: 'USEREMAIL',
    //   message: 'Enter author email',
    //   required: true,
    //   default: email,
    //   useDefault: true,
    //   type: 'text',
    // },
    {
      name: 'MODULENAME',
      message: 'Enter the module name',
      required: true,
      type: 'text',
    },
    // {
    //   name: 'REPONAME',
    //   message: 'Enter the repository name',
    //   required: true,
    //   type: 'text',
    // },
    // {
    //   name: 'USERNAME',
    //   message: 'Enter your GitHub username',
    //   required: true,
    //   type: 'text',
    // },
    // {
    //   name: 'ACCESS',
    //   message: 'Module access?',
    //   required: true,
    //   type: 'autocomplete',
    //   options: ['public', 'restricted'],
    // },
    {
        name: 'extensions',
        message: 'which extensions?',
        options: availExtensions,
        type: 'checkbox',
        // default: ['plpgsql'],
        // default: [{
        //      name: 'plpgsql',
        //      value: 'plpgsql'
        // }],
        required: true
      },
  ];

  const answers = await prompter.prompt(argv, moduleQuestions);
  const modName = sluggify(answers.MODULENAME);
  let targetPath: string;

  if (isAtWorkspaceRoot) {
    const packagesDir = path.join(cwd, 'packages');
    mkdirp.sync(packagesDir);
    targetPath = path.join(packagesDir, modName);
    mkdirp.sync(targetPath);
    console.log(chalk.green(`Created module in workspace packages/: ${targetPath}`));
  } else {
    targetPath = path.join(cwd, modName);
    mkdirp.sync(targetPath);
    console.log(chalk.green(`Created module: ${targetPath}`));
  }

  const cur = process.cwd();
  process.chdir(targetPath);

  writeRenderedTemplates(moduleTemplate, targetPath, { ...argv, ...answers });

  const cmd = ['sqitch', 'init', modName, '--engine', 'pg'].join(' ');
  exec(cmd.trim());

  const plan = `%syntax-version=1.0.0
%project=${modName}
%uri=${modName}`;

  writeFileSync(`${targetPath}/sqitch.plan`, plan);

  const info = await getExtensionInfo(targetPath);

  await writeExtensionMakefile(
    info.Makefile,
    modName,
    '0.0.1'
  );
  await writeExtensionControlFile(
    info.controlFile,
    modName,
    answers.extensions.map((a:any)=>a.name),
    '0.0.1'
  );

  process.chdir(cur);
  return { ...argv, ...answers };
}
