import * as fs from 'fs';
import * as path from 'path';
import { PgpmOptions } from '@pgpmjs/types';
import { walkUp } from './utils';

/**
 * Load configuration file with support for both .js and .json formats
 * Moved from PgpmPackage class for better reusability
 */
export const loadConfigFileSync = (configPath: string): PgpmOptions => {
  const ext = path.extname(configPath);
  
  switch (ext) {
    case '.json':
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    case '.js':
      // delete require.cache[require.resolve(configPath)];
      const configModule = require(configPath);
      return configModule.default || configModule;
    
    default:
      throw new Error(`Unsupported config file type: ${ext}`);
  }
};

/**
 * Load configuration from a specific directory
 * Moved from PgpmPackage class for better reusability
 */
export const loadConfigSyncFromDir = (dir: string): PgpmOptions => {
  const configFiles = [
    'pgpm.config.js',
    'pgpm.json'
  ];
  
  for (const filename of configFiles) {
    const configPath = path.join(dir, filename);
    if (fs.existsSync(configPath)) {
      return loadConfigFileSync(configPath);
    }
  }
  
  throw new Error('No pgpm config file found. Expected one of: ' + configFiles.join(', '));
};

/**
 * Load configuration using walkUp to find config files
 * Enhanced version that uses the robust config loading logic
 */
export const loadConfigSync = (cwd: string = process.cwd()): PgpmOptions => {
  const configFiles = ['pgpm.config.js', 'pgpm.json'];
  
  for (const filename of configFiles) {
    try {
      const configDir = walkUp(cwd, filename);
      return loadConfigSyncFromDir(configDir);
    } catch {
    }
  }
  
  return {};
};

/**
 * Resolve the path to the PGPM workspace by finding config files
 * Moved from PgpmPackage class for better reusability
 */
export const resolvePgpmPath = (cwd: string = process.cwd()): string | undefined => {
  const configFiles = ['pgpm.config.js', 'pgpm.json'];
  
  for (const filename of configFiles) {
    try {
      return walkUp(cwd, filename);
    } catch {
    }
  }
  
  return undefined;
};
