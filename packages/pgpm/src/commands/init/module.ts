import { LaunchQLPackage, sluggify } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { errors, getGitConfigInfo } from '@launchql/types';
import { Inquirerer, OptionValue, Question } from 'inquirerer';
import fs from 'fs';
import path from 'path';

import { DEFAULT_TEMPLATE_URL, runCreateGenApp } from './create-gen-app';

const log = new Logger('module-init');

export default async function runModuleSetup(
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer
) {
  const { email, username } = getGitConfigInfo();
  const { cwd = process.cwd() } = argv;

  const project = new LaunchQLPackage(cwd);

  if (!project.workspacePath) {
    log.error('Not inside a LaunchQL workspace.');
    throw errors.NOT_IN_WORKSPACE({});
  }

  if (!project.isInsideAllowedDirs(cwd) && !project.isInWorkspace() && !project.isParentOfAllowedDirs(cwd)) {
    log.error('You must be inside the workspace root or a parent directory of modules (like packages/).');
    throw errors.NOT_IN_WORKSPACE_MODULE({});
  }

  const availExtensions = project.getAvailableModules();

  const moduleQuestions: Question[] = [
    {
      name: 'MODULENAME',
      message: 'Enter the module name',
      required: true,
      type: 'text',
    },
    {
      name: 'extensions',
      message: 'Which extensions?',
      options: availExtensions,
      type: 'checkbox',
      allowCustomOptions: true,
      required: true,
    },
  ];

  const answers = await prompter.prompt(argv, moduleQuestions);
  const modName = sluggify(answers.MODULENAME);

  const extensions = answers.extensions
    .filter((opt: OptionValue) => opt.selected)
    .map((opt: OptionValue) => opt.name);

  const repo = (argv.repo as string) ?? DEFAULT_TEMPLATE_URL;
  const branch = (argv.fromBranch as string) ?? (argv['from-branch'] as string);
  const fromPath = (argv.templatePath as string) ?? (argv['template-path'] as string) ?? 'module';

  const targetPath = resolveModuleTargetPath(project, cwd, modName);
  fs.mkdirSync(targetPath, { recursive: true });
  const normalizedAnswerOverrides = normalizeAnswers(argv.answers || {});

  const baseAnswers = normalizeAnswers({
    moduleName: modName,
    repoName: modName,
    moduleDesc: modName,
    packageIdentifier: modName,
    fullName: username || modName,
    email,
    username,
    access: (argv as any).access || 'public',
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

  // Ensure core sqitch artifacts exist even if template is missing them
  ensureSqitchArtifacts(project, targetPath, modName);
  // Persist selected extensions if possible
  setModuleDependenciesSafe(project, targetPath, cwd, extensions);

  log.success(`Initialized module: ${modName}`);
  return { ...argv, ...answers };
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

function resolveModuleTargetPath(project: LaunchQLPackage, cwd: string, modName: string): string {
  const resolvedCwd = path.resolve(cwd);
  const workspaceRoot = project.workspacePath ? path.resolve(project.workspacePath) : undefined;

  if (workspaceRoot && workspaceRoot === resolvedCwd) {
    const packagesDir = path.join(resolvedCwd, 'packages');
    fs.mkdirSync(packagesDir, { recursive: true });
    return path.join(packagesDir, modName);
  }

  if (project.isParentOfAllowedDirs(cwd)) {
    return path.join(resolvedCwd, modName);
  }

  if (project.isInsideAllowedDirs(cwd)) {
    log.error('Cannot create a module inside an existing module.');
    throw errors.NOT_IN_WORKSPACE_MODULE({});
  }

  log.error('You must be inside the workspace root or a parent directory of modules (like packages/).');
  throw errors.NOT_IN_WORKSPACE_MODULE({});
}

function ensureSqitchArtifacts(project: LaunchQLPackage, targetPath: string, modName: string) {
  // Create pgpm.plan and deploy/revert/verify directories if missing
  const planPath = path.join(targetPath, 'pgpm.plan');
  if (!fs.existsSync(planPath)) {
    project.initModuleSqitch(modName, targetPath);
  }

  const dirs = ['deploy', 'revert', 'verify'];
  dirs.forEach(dir => {
    const dirPath = path.join(targetPath, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
}

function setModuleDependenciesSafe(
  project: LaunchQLPackage,
  targetPath: string,
  originalCwd: string,
  extensions: string[]
) {
  try {
    project.resetCwd(targetPath);
    project.setModuleDependencies(extensions);
  } catch (err) {
    log.warn(`Could not persist extensions: ${(err as Error).message}`);
  } finally {
    project.resetCwd(originalCwd);
  }
}
