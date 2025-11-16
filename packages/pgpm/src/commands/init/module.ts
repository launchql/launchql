import { LaunchQLPackage, sluggify } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { errors } from '@launchql/types';
import { Inquirerer, OptionValue, Question } from 'inquirerer';
import { mkdirSync } from 'fs';
import path from 'path';
import { buildInitSession } from './session';

const log = new Logger('module-init');

export default async function runModuleSetup(
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer
) {
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

  const extensionsQuestion: Question = {
    name: 'extensions',
    message: 'Which extensions?',
    options: availExtensions,
    type: 'checkbox',
    allowCustomOptions: true,
    required: true,
  };

  const result = await buildInitSession({
    type: 'module',
    argv,
    prompter,
    cwd,
    additionalQuestions: [extensionsQuestion]
  });

  if (result.dryRun) {
    log.info('Dry run completed, no files were written');
    return { ...argv, ...result.vars };
  }

  const modName = sluggify(result.vars.MODULENAME || result.vars.name || path.basename(cwd));
  const targetPath = path.join(cwd, modName);

  if (result.targetDir !== targetPath) {
    mkdirSync(targetPath, { recursive: true });
  }

  const extensions = result.vars.extensions
    ? result.vars.extensions
        .filter((opt: OptionValue) => opt.selected)
        .map((opt: OptionValue) => opt.name)
    : [];

  project.initModule({
    name: modName,
    description: result.vars.MODULEDESC || result.vars.description || `${modName} module`,
    author: result.vars.USERFULLNAME || result.vars.author || 'Unknown',
    extensions,
    templateSource: argv.repo || argv.templatePath ? {
      type: argv.repo ? 'github' : 'local',
      path: argv.repo || argv.templatePath,
      branch: argv.fromBranch
    } : undefined
  });

  log.success(`Initialized module: ${modName}`);
  return { ...argv, ...result.vars };
}

