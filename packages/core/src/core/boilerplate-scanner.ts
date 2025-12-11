import fs from 'fs';
import path from 'path';

import {
  BoilerplateConfig,
  BoilerplatesRootConfig,
  ScannedBoilerplate
} from './boilerplate-types';

/**
 * Read the root `.boilerplates.json` configuration from a template repository.
 * This file specifies the default directory containing boilerplate templates.
 *
 * @param templateDir - The root directory of the template repository
 * @returns The root config or null if not found
 */
export function readBoilerplatesConfig(templateDir: string): BoilerplatesRootConfig | null {
  const configPath = path.join(templateDir, '.boilerplates.json');
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(content) as BoilerplatesRootConfig;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Read the `.boilerplate.json` configuration from a boilerplate directory.
 * This file specifies the boilerplate type and questions.
 *
 * @param boilerplatePath - The path to the boilerplate directory
 * @returns The boilerplate config or null if not found
 */
export function readBoilerplateConfig(boilerplatePath: string): BoilerplateConfig | null {
  const jsonPath = path.join(boilerplatePath, '.boilerplate.json');

  if (fs.existsSync(jsonPath)) {
    try {
      const content = fs.readFileSync(jsonPath, 'utf-8');
      return JSON.parse(content) as BoilerplateConfig;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Scan a base directory for boilerplate templates.
 * Each subdirectory with a `.boilerplate.json` file is considered a boilerplate.
 *
 * @param baseDir - The directory to scan (e.g., "default/")
 * @returns Array of scanned boilerplates with their configurations
 */
export function scanBoilerplates(baseDir: string): ScannedBoilerplate[] {
  const boilerplates: ScannedBoilerplate[] = [];

  if (!fs.existsSync(baseDir)) {
    return boilerplates;
  }

  const entries = fs.readdirSync(baseDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const boilerplatePath = path.join(baseDir, entry.name);
    const config = readBoilerplateConfig(boilerplatePath);

    if (config) {
      boilerplates.push({
        name: entry.name,
        path: boilerplatePath,
        type: config.type ?? 'module',
        questions: config.questions
      });
    }
  }

  return boilerplates;
}

/**
 * Find a boilerplate by type within a scanned list.
 *
 * @param boilerplates - Array of scanned boilerplates
 * @param type - The type to find ('workspace' or 'module')
 * @returns The matching boilerplate or undefined
 */
export function findBoilerplateByType(
  boilerplates: ScannedBoilerplate[],
  type: 'workspace' | 'module'
): ScannedBoilerplate | undefined {
  return boilerplates.find((bp) => bp.type === type);
}

/**
 * Resolve the base directory for boilerplates in a template repository.
 * Uses `.boilerplates.json` if present, otherwise returns empty string.
 *
 * @param templateDir - The root directory of the template repository
 * @returns The resolved base directory path
 */
export function resolveBoilerplateBaseDir(templateDir: string): string {
  const rootConfig = readBoilerplatesConfig(templateDir);
  if (rootConfig?.dir) {
    return path.join(templateDir, rootConfig.dir);
  }
  return templateDir;
}

