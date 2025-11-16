import { execSync } from 'child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, cpSync, statSync } from 'fs';
import { join, isAbsolute, resolve } from 'path';
import os from 'os';
import { Question } from 'inquirerer';

const DEFAULT_BOILERPLATE_REPO = 'https://github.com/launchql/pgpm-boilerplates';
const DEFAULT_BRANCH = 'main';

export interface BoilerplateOptions {
  repo?: string;
  branch?: string;
  boilerplate?: string;
  templatePath?: string;
}

export interface BoilerplateResult {
  tempDir: string;
  boilerplatePath: string;
  questions: Question[];
  cleanup: () => void;
}

/**
 * Normalize repo input to a format git can clone
 * - owner/repo -> https://github.com/owner/repo
 * - local path -> file://absolute/path
 * - full URL -> unchanged
 */
function normalizeRepo(repo: string): string {
  if (existsSync(repo)) {
    const absPath = isAbsolute(repo) ? repo : resolve(repo);
    return absPath;
  }
  
  if (repo.match(/^[^\/]+\/[^\/]+$/) && !repo.includes('://')) {
    return `https://github.com/${repo}`;
  }
  
  return repo;
}

/**
 * Check if a directory is a git repository
 */
function isGitRepo(path: string): boolean {
  try {
    execSync('git rev-parse --git-dir', {
      cwd: path,
      stdio: 'pipe'
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Create a temporary git repo from a local directory
 * This allows us to maintain the "always clone" invariant even for local paths
 */
function createTempGitRepo(sourcePath: string): string {
  const tempGitDir = mkdtempSync(join(os.tmpdir(), 'pgpm-git-'));
  
  try {
    cpSync(sourcePath, tempGitDir, { recursive: true });
    
    execSync('git init', { cwd: tempGitDir, stdio: 'pipe' });
    execSync('git add .', { cwd: tempGitDir, stdio: 'pipe' });
    execSync('git commit -m "boilerplate"', {
      cwd: tempGitDir,
      stdio: 'pipe',
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: 'pgpm',
        GIT_AUTHOR_EMAIL: 'pgpm@localhost',
        GIT_COMMITTER_NAME: 'pgpm',
        GIT_COMMITTER_EMAIL: 'pgpm@localhost'
      }
    });
    
    return tempGitDir;
  } catch (error) {
    rmSync(tempGitDir, { recursive: true, force: true });
    throw error;
  }
}

/**
 * Clone boilerplate repository and load questions from .questions.json
 */
export function loadBoilerplate(
  type: 'module' | 'workspace',
  options: BoilerplateOptions = {}
): BoilerplateResult {
  const repoInput = options.templatePath || options.repo || process.env.PGPM_BOILERPLATE_REPO || DEFAULT_BOILERPLATE_REPO;
  const branch = options.branch || DEFAULT_BRANCH;
  
  const tempDir = mkdtempSync(join(os.tmpdir(), 'pgpm-boilerplate-'));
  let tempGitDir: string | null = null;
  
  const cleanup = () => {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch (error) {
    }
    if (tempGitDir) {
      try {
        rmSync(tempGitDir, { recursive: true, force: true });
      } catch (error) {
      }
    }
  };

  try {
    let repoToClone = normalizeRepo(repoInput);
    
    if (existsSync(repoToClone) && statSync(repoToClone).isDirectory()) {
      if (!isGitRepo(repoToClone)) {
        tempGitDir = createTempGitRepo(repoToClone);
        repoToClone = tempGitDir;
      }
    }
    
    // Clone the repository
    execSync(`git clone --depth 1 --branch ${branch} ${repoToClone} ${tempDir}`, {
      stdio: 'pipe',
      env: {
        ...process.env,
        GIT_TERMINAL_PROMPT: '0',
        GIT_ASKPASS: 'echo',
      }
    });

    let boilerplatePath: string;
    
    if (options.boilerplate) {
      boilerplatePath = join(tempDir, options.boilerplate);
      if (!existsSync(boilerplatePath)) {
        throw new Error(`Boilerplate '${options.boilerplate}' not found in repository`);
      }
    } else {
      boilerplatePath = join(tempDir, type);
      if (!existsSync(boilerplatePath)) {
        throw new Error(`Default boilerplate '${type}' not found in repository`);
      }
    }

    const questionsPath = join(boilerplatePath, '.questions.json');
    let questions: Question[] = [];
    
    if (existsSync(questionsPath)) {
      const questionsContent = readFileSync(questionsPath, 'utf-8');
      questions = JSON.parse(questionsContent);
    }

    return {
      tempDir,
      boilerplatePath,
      questions,
      cleanup
    };
  } catch (error) {
    cleanup();
    throw error;
  }
}

/**
 * List available boilerplates in the repository
 */
export function listAvailableBoilerplates(options: BoilerplateOptions = {}): string[] {
  const repoInput = options.templatePath || options.repo || process.env.PGPM_BOILERPLATE_REPO || DEFAULT_BOILERPLATE_REPO;
  const branch = options.branch || DEFAULT_BRANCH;
  
  const tempDir = mkdtempSync(join(os.tmpdir(), 'pgpm-boilerplate-list-'));
  let tempGitDir: string | null = null;
  
  try {
    let repoToClone = normalizeRepo(repoInput);
    
    if (existsSync(repoToClone) && statSync(repoToClone).isDirectory()) {
      if (!isGitRepo(repoToClone)) {
        tempGitDir = createTempGitRepo(repoToClone);
        repoToClone = tempGitDir;
      }
    }
    
    execSync(`git clone --depth 1 --branch ${branch} ${repoToClone} ${tempDir}`, {
      stdio: 'pipe',
      env: {
        ...process.env,
        GIT_TERMINAL_PROMPT: '0',
        GIT_ASKPASS: 'echo',
      }
    });

    const entries = readdirSync(tempDir, { withFileTypes: true });
    const boilerplates = entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => entry.name);

    return boilerplates;
  } finally {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch (error) {
    }
    if (tempGitDir) {
      try {
        rmSync(tempGitDir, { recursive: true, force: true });
      } catch (error) {
      }
    }
  }
}
