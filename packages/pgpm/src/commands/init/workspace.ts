import { sluggify } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { Inquirerer } from 'inquirerer';
import { mkdirSync } from 'fs';
import path from 'path';
import { buildInitSession } from './session';

const log = new Logger('workspace-init');

export default async function runWorkspaceSetup(
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer
) {
  const { cwd = process.cwd() } = argv;
  const workspaceName = argv.name || path.basename(cwd);
  const targetPath = path.join(cwd, sluggify(workspaceName));

  mkdirSync(targetPath, { recursive: true });
  log.success(`Created workspace directory: ${targetPath}`);

  const result = await buildInitSession({
    type: 'workspace',
    argv: { ...argv, cwd: targetPath },
    prompter,
    cwd: targetPath
  });

  if (result.dryRun) {
    log.info('Dry run completed, no files were written');
  } else {
    log.success('Workspace initialized successfully.');
  }

  return { ...argv, ...result.vars, cwd: targetPath };
}

