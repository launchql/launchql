import fs from 'fs';
import path from 'path';
import { appstash, resolve as resolveAppstash } from 'appstash';
import { UpdateCheckConfig, UPDATE_CHECK_APPSTASH_KEY } from '@pgpmjs/types';

export interface UpdateConfigOptions {
  toolName?: string;
  baseDir?: string;
  key?: string;
}

const defaultToolName = 'pgpm';

const getConfigPath = (options: UpdateConfigOptions = {}) => {
  const toolName = options.toolName ?? defaultToolName;
  const dirs = appstash(toolName, {
    ensure: true,
    baseDir: options.baseDir
  });

  const configDir = resolveAppstash(dirs, 'config');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const fileName = `${(options.key ?? UPDATE_CHECK_APPSTASH_KEY).replace(/[^a-z0-9-_]/gi, '_')}.json`;
  return path.join(configDir, fileName);
};

export const shouldCheck = (now: number, lastCheckedAt: number | undefined, ttlMs: number): boolean => {
  if (!lastCheckedAt) return true;
  return now - lastCheckedAt > ttlMs;
};

export async function readUpdateConfig(options: UpdateConfigOptions = {}): Promise<UpdateCheckConfig | null> {
  const configPath = getConfigPath(options);

  if (!fs.existsSync(configPath)) {
    return null;
  }

  try {
    const contents = await fs.promises.readFile(configPath, 'utf8');
    const parsed = JSON.parse(contents) as UpdateCheckConfig;
    return parsed;
  } catch {
    // Corrupted config – clear it
    try {
      await fs.promises.rm(configPath, { force: true });
    } catch {
      // ignore
    }
    return null;
  }
}

export async function writeUpdateConfig(config: UpdateCheckConfig, options: UpdateConfigOptions = {}): Promise<void> {
  const configPath = getConfigPath(options);
  await fs.promises.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
}

// Exposed for testing to locate the config path for a given namespace/baseDir
export const resolveUpdateConfigPath = (options: UpdateConfigOptions = {}) => getConfigPath(options);
