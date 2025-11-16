import { execSync } from 'child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import os from 'os';
import { Question } from 'inquirerer';

const DEFAULT_BOILERPLATE_REPO = 'https://github.com/launchql/pgpm-boilerplates';
const DEFAULT_BRANCH = 'main';

export interface BoilerplateOptions {
  repo?: string;
  branch?: string;
  boilerplate?: string;
}

export interface BoilerplateResult {
  tempDir: string;
  boilerplatePath: string;
  questions: Question[];
  cleanup: () => void;
}

/**
 * Clone boilerplate repository and load questions from .questions.json
 */
export function loadBoilerplate(
  type: 'module' | 'workspace',
  options: BoilerplateOptions = {}
): BoilerplateResult {
  const repo = options.repo || DEFAULT_BOILERPLATE_REPO;
  const branch = options.branch || DEFAULT_BRANCH;
  
  const tempDir = mkdtempSync(join(os.tmpdir(), 'pgpm-boilerplate-'));
  
  const cleanup = () => {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch (error) {
    }
  };

  try {
    // Clone the repository
    execSync(`git clone --depth 1 --branch ${branch} ${repo} ${tempDir}`, {
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
  const repo = options.repo || DEFAULT_BOILERPLATE_REPO;
  const branch = options.branch || DEFAULT_BRANCH;
  
  const tempDir = mkdtempSync(join(os.tmpdir(), 'pgpm-boilerplate-list-'));
  
  try {
    // Clone the repository
    execSync(`git clone --depth 1 --branch ${branch} ${repo} ${tempDir}`, {
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
  }
}
