import { resolve, join } from 'path';
import { existsSync } from 'fs';

import { compileTemplatesToFunctions } from '../src/templatize/compileTemplatesToFunctions';
import { writeCompiledTemplatesToFile } from '../src/templatize/writeCompiledTemplatesToFile';

/**
 * Find project root by looking for lerna.json or pnpm-workspace.yaml
 */
function findProjectRoot(startDir: string): string {
  let currentDir = resolve(startDir);
  
  while (currentDir) {
    if (existsSync(join(currentDir, 'lerna.json')) || 
        existsSync(join(currentDir, 'pnpm-workspace.yaml'))) {
      return currentDir;
    }
    
    const parentDir = resolve(currentDir, '..');
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }
  
  throw new Error('Could not find project root directory');
}

// Support custom boilerplates path via environment variable or default to project root
const boilerplatesPath = process.env.LAUNCHQL_BOILERPLATES_PATH || 
  join(findProjectRoot(__dirname), 'boilerplates');

const workspaceDir = join(boilerplatesPath, 'workspace');
const packageDir = join(boilerplatesPath, 'module');

if (!existsSync(workspaceDir)) {
  throw new Error(`Workspace boilerplates directory not found: ${workspaceDir}`);
}

if (!existsSync(packageDir)) {
  throw new Error(`Module boilerplates directory not found: ${packageDir}`);
}

const compiled1 = compileTemplatesToFunctions(workspaceDir);
writeCompiledTemplatesToFile(workspaceDir, compiled1, './src/generated/workspace.ts');

const compiled2 = compileTemplatesToFunctions(packageDir);
writeCompiledTemplatesToFile(packageDir, compiled2, './src/generated/module.ts');