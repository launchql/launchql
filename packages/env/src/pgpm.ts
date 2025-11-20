import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import deepmerge from 'deepmerge';
import { LaunchQLOptions } from '@launchql/types';
import { walkUp } from './utils';

/**
 * Resolved PGPM environment configuration
 */
export interface ResolvedPgpmEnv {
  /**
   * Configuration directory (e.g., ~/.config/pgpm)
   */
  configDir: string;
  
  /**
   * Cache directory (e.g., ~/.cache/pgpm)
   */
  cacheDir: string;
  
  /**
   * State directory (e.g., ~/.pgpm)
   */
  stateDir: string;
  
  /**
   * Whether to skip loading user/global config
   */
  noGlobalConfig: boolean;
  
  /**
   * Merged LaunchQL options from all sources
   */
  options: LaunchQLOptions;
  
  /**
   * Path to user/global config file (if loaded)
   */
  userConfigPath?: string;
  
  /**
   * Path to project-local config file (if loaded)
   */
  projectConfigPath?: string;
}

/**
 * CLI flags that can override environment configuration
 */
export interface PgpmFlags {
  /**
   * Override config directory path
   */
  configDir?: string;
  
  /**
   * Override cache directory path
   */
  cacheDir?: string;
  
  /**
   * Override state directory path
   */
  stateDir?: string;
  
  /**
   * Disable loading user/global config
   */
  noGlobalConfig?: boolean;
}

/**
 * Options for resolvePgpmEnv
 */
export interface ResolvePgpmEnvOptions {
  /**
   * Parsed CLI flags
   */
  flags?: PgpmFlags;
  
  /**
   * Environment variables (defaults to process.env)
   */
  env?: NodeJS.ProcessEnv;
  
  /**
   * Current working directory (defaults to process.cwd())
   */
  cwd?: string;
}

/**
 * Get XDG base directories with fallbacks
 */
function getXdgDirs(): { config: string; cache: string; state: string } {
  try {
    const homeDir = os.homedir();
    
    return {
      config: process.env.XDG_CONFIG_HOME || path.join(homeDir, '.config'),
      cache: process.env.XDG_CACHE_HOME || path.join(homeDir, '.cache'),
      state: homeDir // Use home for state dir to maintain ~/.pgpm default
    };
  } catch {
    return {
      config: '.config',
      cache: '.cache',
      state: '.'
    };
  }
}

/**
 * Expand ~ in paths to home directory
 */
function expandHome(filepath: string): string {
  if (filepath.startsWith('~/')) {
    try {
      return path.join(os.homedir(), filepath.slice(2));
    } catch {
      return filepath;
    }
  }
  return filepath;
}

/**
 * Load a config file with support for .js, .cjs, .json
 * Returns empty object on failure (graceful)
 */
function loadConfigFile(configPath: string): LaunchQLOptions {
  try {
    if (!fs.existsSync(configPath)) {
      return {};
    }
    
    const ext = path.extname(configPath).toLowerCase();
    
    switch (ext) {
      case '.json':
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      case '.js':
      case '.cjs':
        delete require.cache[require.resolve(configPath)];
        const configModule = require(configPath);
        return configModule.default || configModule;
      
      default:
        return {};
    }
  } catch {
    return {};
  }
}

/**
 * Load user/global config from config directory
 * Tries config.json, config.js, config.cjs in that order
 */
function loadUserConfig(configDir: string): { config: LaunchQLOptions; path?: string } {
  const configFiles = ['config.json', 'config.js', 'config.cjs'];
  
  for (const filename of configFiles) {
    const configPath = path.join(configDir, filename);
    const config = loadConfigFile(configPath);
    
    if (Object.keys(config).length > 0) {
      return { config, path: configPath };
    }
  }
  
  return { config: {} };
}

/**
 * Load project-local config from current working directory
 * Walks up directories to find pgpm.config.(js|cjs|json) or pgpm.json
 */
function loadProjectConfig(cwd: string): { config: LaunchQLOptions; path?: string } {
  const configFiles = [
    'pgpm.config.js',
    'pgpm.config.cjs',
    'pgpm.config.json',
    'pgpm.json'
  ];
  
  for (const filename of configFiles) {
    try {
      const configDir = walkUp(cwd, filename);
      const configPath = path.join(configDir, filename);
      const config = loadConfigFile(configPath);
      
      if (Object.keys(config).length > 0) {
        return { config, path: configPath };
      }
    } catch {
    }
  }
  
  return { config: {} };
}

/**
 * Resolve PGPM environment configuration with precedence:
 * CLI flags → env vars → project config → user/global config → defaults
 * 
 * @example
 * ```typescript
 * // From CLI
 * const resolved = resolvePgpmEnv({
 *   flags: { noGlobalConfig: true },
 *   env: process.env,
 *   cwd: process.cwd()
 * });
 * 
 * // Use resolved directories
 * const pgpmHome = new PgpmHome({ stateDir: resolved.stateDir });
 * 
 * // Use merged options
 * const dbConfig = resolved.options.db;
 * ```
 */
export function resolvePgpmEnv(options: ResolvePgpmEnvOptions = {}): ResolvedPgpmEnv {
  const {
    flags = {},
    env = process.env,
    cwd = process.cwd()
  } = options;
  
  const xdgDirs = getXdgDirs();
  
  const defaultConfigDir = path.join(xdgDirs.config, 'pgpm');
  const defaultCacheDir = path.join(xdgDirs.cache, 'pgpm');
  const defaultStateDir = path.join(xdgDirs.state, '.pgpm'); // ~/.pgpm
  
  const noGlobalConfig = 
    flags.noGlobalConfig ?? 
    (env.PGPM_NO_GLOBAL_CONFIG === '1' || env.PGPM_NO_GLOBAL_CONFIG === 'true') ??
    false;
  
  let configDir = flags.configDir || env.PGPM_CONFIG_DIR || defaultConfigDir;
  let cacheDir = flags.cacheDir || env.PGPM_CACHE_DIR || defaultCacheDir;
  let stateDir = flags.stateDir || env.PGPM_STATE_DIR || defaultStateDir;
  
  configDir = expandHome(configDir);
  cacheDir = expandHome(cacheDir);
  stateDir = expandHome(stateDir);
  
  const defaultOptions: LaunchQLOptions = {};
  
  let userConfigPath: string | undefined;
  let userConfig: LaunchQLOptions = {};
  if (!noGlobalConfig) {
    const userResult = loadUserConfig(configDir);
    userConfig = userResult.config;
    userConfigPath = userResult.path;
  }
  
  const projectResult = loadProjectConfig(cwd);
  const projectConfig = projectResult.config;
  const projectConfigPath = projectResult.path;
  
  const envConfig: LaunchQLOptions = {};
  
  const mergedOptions = deepmerge.all([
    defaultOptions,
    userConfig,
    projectConfig,
    envConfig
  ]) as LaunchQLOptions;
  
  return {
    configDir,
    cacheDir,
    stateDir,
    noGlobalConfig,
    options: mergedOptions,
    userConfigPath,
    projectConfigPath
  };
}

/**
 * Get default PGPM directories without loading any config
 * Useful for simple cases where you just need the directories
 */
export function getDefaultPgpmDirs(): { configDir: string; cacheDir: string; stateDir: string } {
  const xdgDirs = getXdgDirs();
  
  return {
    configDir: path.join(xdgDirs.config, 'pgpm'),
    cacheDir: path.join(xdgDirs.cache, 'pgpm'),
    stateDir: path.join(xdgDirs.state, '.pgpm')
  };
}
