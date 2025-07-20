import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { LaunchQLOptions } from '@launchql/types';
import { walkUp } from './utils';

/**
 * Load configuration from a specific directory
 */
export const loadConfigSyncFromDir = (dir: string): LaunchQLOptions => {
  const jsConfigPath = resolve(dir, 'launchql.config.js');
  const jsonConfigPath = resolve(dir, 'launchql.json');

  if (existsSync(jsConfigPath)) {
    delete require.cache[jsConfigPath];
    const config = require(jsConfigPath);
    return config.default || config;
  }

  if (existsSync(jsonConfigPath)) {
    const configContent = readFileSync(jsonConfigPath, 'utf8');
    return JSON.parse(configContent);
  }

  return {};
};

/**
 * Load configuration using walkUp to find config files
 */
export const loadConfigSync = (cwd: string = process.cwd()): LaunchQLOptions => {
  try {
    try {
      const configDir = walkUp(cwd, 'launchql.config.js');
      return loadConfigSyncFromDir(configDir);
    } catch {
      try {
        const configDir = walkUp(cwd, 'launchql.json');
        return loadConfigSyncFromDir(configDir);
      } catch {
        return {};
      }
    }
  } catch {
    return {};
  }
};
