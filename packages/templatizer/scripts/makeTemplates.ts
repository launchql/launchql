import { resolve, join } from 'path';
import { existsSync, readFileSync } from 'fs';

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

/**
 * Extract all variable names from .questions.json
 */
function getDefinedVariables(templateDir: string): Set<string> {
  const questionsPath = join(templateDir, '.questions.json');
  if (!existsSync(questionsPath)) {
    console.warn(`Warning: .questions.json not found in ${templateDir}`);
    return new Set();
  }
  
  try {
    const questions = JSON.parse(readFileSync(questionsPath, 'utf8'));
    return new Set(questions.map((q: any) => q.name));
  } catch (error) {
    console.warn(`Warning: Failed to parse .questions.json in ${templateDir}:`, error);
    return new Set();
  }
}

/**
 * Extract all variable references from template content
 */
function extractVariableReferences(content: string): Set<string> {
  const matches = content.matchAll(/__([A-Z0-9_]+)__/g);
  return new Set(Array.from(matches, m => `__${m[1]}__`));
}

/**
 * Validate that all variables used in templates are defined in .questions.json
 */
function validateTemplateVariables(templateDir: string, templateType: string): void {
  const definedVars = getDefinedVariables(templateDir);
  const usedVars = new Set<string>();
  
  const glob = require('glob');
  const files = glob.sync('**/*', { cwd: templateDir, nodir: true, dot: true });
  
  files.forEach((file: string) => {
    if (file === '.questions.json') return;
    
    const fullPath = join(templateDir, file);
    const content = readFileSync(fullPath, 'utf8');
    
    extractVariableReferences(file).forEach(v => usedVars.add(v));
    
    extractVariableReferences(content).forEach(v => usedVars.add(v));
  });
  
  const undefinedVars = Array.from(usedVars).filter(v => !definedVars.has(v));
  
  if (undefinedVars.length > 0) {
    console.error(`\n❌ Error: Undefined variables found in ${templateType} templates:`);
    undefinedVars.forEach(v => {
      console.error(`  - ${v}`);
    });
    console.error(`\nPlease add these variables to ${templateDir}/.questions.json\n`);
    throw new Error(`Template validation failed for ${templateType}`);
  }
  
  console.log(`✓ Template validation passed for ${templateType} (${usedVars.size} variables used, ${definedVars.size} defined)`);
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

console.log('\n🔍 Validating template variables...\n');
validateTemplateVariables(workspaceDir, 'workspace');
validateTemplateVariables(packageDir, 'module');

console.log('\n📦 Compiling templates...\n');
const compiled1 = compileTemplatesToFunctions(workspaceDir);
writeCompiledTemplatesToFile(workspaceDir, compiled1, './src/generated/workspace.ts');
console.log('✓ Compiled workspace templates');

const compiled2 = compileTemplatesToFunctions(packageDir);
writeCompiledTemplatesToFile(packageDir, compiled2, './src/generated/module.ts');
console.log('✓ Compiled module templates');

console.log('\n✅ Template compilation complete!\n');
