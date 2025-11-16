import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';
import { mkdtempSync, rmSync } from 'fs';
import os from 'os';
import { compileTemplatesToFunctions } from './templatize/compileTemplatesToFunctions';

export interface TemplateSource {
  type: 'local' | 'github';
  path: string;
  branch?: string;
}

/**
 * Resolve the template directory path from a template source
 * Returns the directory path and an optional cleanup function
 */
export function resolveTemplateDirectory(
  source: TemplateSource,
  templateType: 'workspace' | 'module'
): { templateDir: string; cleanup: (() => void) | null } {
  let templateDir: string;
  let cleanup: (() => void) | null = null;

  if (source.type === 'github') {
    // Clone GitHub repository to temporary directory
    const tempDir = mkdtempSync(join(os.tmpdir(), 'lql-template-'));
    cleanup = () => {
      rmSync(tempDir, { recursive: true, force: true });
    };

    try {
      const repoUrl = source.path.startsWith('http') 
        ? source.path 
        : `https://github.com/${source.path}.git`;
      
      const branch = source.branch || 'main';
      
      // Clone the repository
      // Disable interactive prompts to prevent GitHub authentication popups for public repos
      execSync(`git clone --depth 1 --branch ${branch} ${repoUrl} ${tempDir}`, {
        stdio: 'inherit',
        env: {
          ...process.env,
          GIT_TERMINAL_PROMPT: '0',  // Disable interactive terminal prompts
          GIT_ASKPASS: 'echo',       // Use echo as askpass (returns empty, no auth needed for public repos)
        }
      });

      // Check if boilerplates directory exists in repo
      const boilerplatesPath = join(tempDir, 'boilerplates');
      if (!existsSync(boilerplatesPath)) {
        throw new Error(`boilerplates directory not found in repository: ${source.path}`);
      }

      templateDir = join(boilerplatesPath, templateType);
      
      if (!existsSync(templateDir)) {
        throw new Error(`Template type '${templateType}' not found in repository: ${source.path}`);
      }
    } catch (error) {
      if (cleanup) cleanup();
      throw error;
    }
  } else {
    // Local path - can be either direct path to template directory or boilerplates root
    const resolvedPath = resolve(source.path);
    
    // Check if path points directly to workspace/module directory
    if (existsSync(join(resolvedPath, '.questions.json'))) {
      // Direct path to template directory
      templateDir = resolvedPath;
    } else {
      // Path to boilerplates root
      templateDir = join(resolvedPath, templateType);
      
      if (!existsSync(templateDir)) {
        throw new Error(`Template type '${templateType}' not found at path: ${templateDir}`);
      }
    }
    
    if (!existsSync(templateDir)) {
      throw new Error(`Template directory not found: ${templateDir}`);
    }
  }

  return { templateDir, cleanup };
}

/**
 * Load templates from a local path or GitHub repository
 */
export function loadTemplates(
  source: TemplateSource,
  templateType: 'workspace' | 'module'
): ReturnType<typeof compileTemplatesToFunctions> {
  const { templateDir, cleanup } = resolveTemplateDirectory(source, templateType);

  try {
    const templates = compileTemplatesToFunctions(templateDir);
    return templates;
  } finally {
    // Cleanup temporary directory if needed
    if (cleanup) cleanup();
  }
}


