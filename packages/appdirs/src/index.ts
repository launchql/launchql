import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Result from appdirs() containing all resolved directory paths
 */
export interface AppDirsResult {
  /** Root directory: ~/.<tool> */
  root: string;
  /** Config directory: ~/.<tool>/config */
  config: string;
  /** Cache directory: ~/.<tool>/cache */
  cache: string;
  /** Data directory: ~/.<tool>/data */
  data: string;
  /** Logs directory: ~/.<tool>/logs */
  logs: string;
  /** Temp directory: /tmp/<tool> */
  tmp: string;
  /** True if XDG or tmp fallback was used during ensure */
  usedFallback?: boolean;
}

/**
 * Options for appdirs()
 */
export interface AppDirsOptions {
  /** Base directory (defaults to os.homedir()) */
  baseDir?: string;
  /** Use XDG fallback if home fails (default: true) */
  useXdgFallback?: boolean;
  /** Automatically create directories (default: false) */
  ensure?: boolean;
  /** Root for temp directory (defaults to os.tmpdir()) */
  tmpRoot?: string;
}

/**
 * Result from ensure() containing created directories
 */
export interface EnsureResult {
  /** Directories that were created */
  created: string[];
  /** True if XDG or tmp fallback was used */
  usedFallback: boolean;
}

/**
 * Get home directory with fallback
 */
function getHomeDir(): string | null {
  try {
    const home = os.homedir();
    if (home && home !== '/') {
      return home;
    }
  } catch {
  }
  return null;
}

/**
 * Get XDG directories as fallback
 */
function getXdgDirs(): { config: string; cache: string; data: string; state: string } | null {
  try {
    const home = getHomeDir();
    if (!home) return null;
    
    return {
      config: process.env.XDG_CONFIG_HOME || path.join(home, '.config'),
      cache: process.env.XDG_CACHE_HOME || path.join(home, '.cache'),
      data: process.env.XDG_DATA_HOME || path.join(home, '.local', 'share'),
      state: process.env.XDG_STATE_HOME || path.join(home, '.local', 'state')
    };
  } catch {
    return null;
  }
}

/**
 * Resolve application directories for a given tool name
 * 
 * Primary: ~/.<tool>/{config,cache,data,logs}
 * Fallback: XDG directories (only if home fails or ensure fails)
 * 
 * @param tool - Tool name (e.g., 'pgpm', 'lql')
 * @param options - Configuration options
 * @returns Resolved directory paths
 * 
 * @example
 * ```typescript
 * import { appdirs } from '@launchql/appdirs';
 * 
 * // Get directories without creating them
 * const dirs = appdirs('pgpm');
 * console.log(dirs.config); // ~/.pgpm/config
 * 
 * // Get directories and create them
 * const dirs = appdirs('pgpm', { ensure: true });
 * ```
 */
export function appdirs(tool: string, options: AppDirsOptions = {}): AppDirsResult {
  const {
    baseDir,
    useXdgFallback = true,
    ensure = false,
    tmpRoot = os.tmpdir()
  } = options;
  
  let base: string;
  if (baseDir) {
    base = baseDir;
  } else {
    const home = getHomeDir();
    if (!home) {
      if (useXdgFallback) {
        const xdg = getXdgDirs();
        if (xdg) {
          const result: AppDirsResult = {
            root: path.join(xdg.config, tool),
            config: path.join(xdg.config, tool),
            cache: path.join(xdg.cache, tool),
            data: path.join(xdg.data, tool),
            logs: path.join(xdg.state, tool, 'logs'),
            tmp: path.join(tmpRoot, tool),
            usedFallback: true
          };
          
          if (ensure) {
            const ensureResult = ensureDirectories(result);
            result.usedFallback = ensureResult.usedFallback;
          }
          
          return result;
        }
      }
      
      const tmpBase = path.join(tmpRoot, tool);
      return {
        root: tmpBase,
        config: path.join(tmpBase, 'config'),
        cache: path.join(tmpBase, 'cache'),
        data: path.join(tmpBase, 'data'),
        logs: path.join(tmpBase, 'logs'),
        tmp: tmpBase,
        usedFallback: true
      };
    }
    base = home;
  }
  
  const root = path.join(base, `.${tool}`);
  const result: AppDirsResult = {
    root,
    config: path.join(root, 'config'),
    cache: path.join(root, 'cache'),
    data: path.join(root, 'data'),
    logs: path.join(root, 'logs'),
    tmp: path.join(tmpRoot, tool)
  };
  
  if (ensure) {
    const ensureResult = ensureDirectories(result, useXdgFallback, tmpRoot, tool);
    result.usedFallback = ensureResult.usedFallback;
  }
  
  return result;
}

/**
 * Ensure directories exist, creating them if needed
 * Never throws - returns fallback paths on failure
 * 
 * @param dirs - Directory paths to create
 * @returns Result with created directories and fallback flag
 * 
 * @example
 * ```typescript
 * import { appdirs, ensure } from '@launchql/appdirs';
 * 
 * const dirs = appdirs('pgpm');
 * const result = ensure(dirs);
 * console.log(result.created); // ['~/.pgpm', '~/.pgpm/config', ...]
 * ```
 */
export function ensure(dirs: AppDirsResult): EnsureResult {
  return ensureDirectories(dirs);
}

/**
 * Internal function to ensure directories exist
 */
function ensureDirectories(
  dirs: AppDirsResult,
  useXdgFallback = true,
  tmpRoot = os.tmpdir(),
  tool?: string
): EnsureResult {
  const created: string[] = [];
  let usedFallback = false;
  
  const persistentDirs = [dirs.root, dirs.config, dirs.cache, dirs.data, dirs.logs];
  
  for (const dir of persistentDirs) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        created.push(dir);
      }
    } catch {
      usedFallback = true;
      break;
    }
  }
  
  if (usedFallback && useXdgFallback && tool) {
    const xdg = getXdgDirs();
    if (xdg) {
      dirs.root = path.join(xdg.config, tool);
      dirs.config = path.join(xdg.config, tool);
      dirs.cache = path.join(xdg.cache, tool);
      dirs.data = path.join(xdg.data, tool);
      dirs.logs = path.join(xdg.state, tool, 'logs');
      
      const xdgDirs = [dirs.config, dirs.cache, dirs.data, dirs.logs];
      for (const dir of xdgDirs) {
        try {
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            created.push(dir);
          }
        } catch {
          usedFallback = true;
          const tmpBase = path.join(tmpRoot, tool);
          dirs.root = tmpBase;
          dirs.config = path.join(tmpBase, 'config');
          dirs.cache = path.join(tmpBase, 'cache');
          dirs.data = path.join(tmpBase, 'data');
          dirs.logs = path.join(tmpBase, 'logs');
          break;
        }
      }
    }
  }
  
  return { created, usedFallback };
}

/**
 * Resolve a path within a specific directory kind
 * 
 * @param dirs - Directory paths from appdirs()
 * @param kind - Directory kind (config, cache, data, logs, tmp)
 * @param parts - Path parts to join
 * @returns Resolved path
 * 
 * @example
 * ```typescript
 * import { appdirs, resolve } from '@launchql/appdirs';
 * 
 * const dirs = appdirs('pgpm');
 * const dbPath = resolve(dirs, 'data', 'repos', 'my-repo');
 * // Returns: ~/.pgpm/data/repos/my-repo
 * ```
 */
export function resolve(
  dirs: AppDirsResult,
  kind: 'config' | 'cache' | 'data' | 'logs' | 'tmp',
  ...parts: string[]
): string {
  return path.join(dirs[kind], ...parts);
}
