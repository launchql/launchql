import fs from 'fs';
import path from 'path';

import { appstash, ensure, resolve } from 'appstash';

import { UPDATE_CHECK_APPSTASH_KEY, UpdateCheckConfig } from '@launchql/types';

interface ConfigOptions {
  toolName?: string;
  configKey?: string;
}

const DEFAULT_TOOL = 'pgpm';

function getConfigPath(options: ConfigOptions = {}) {
  const toolName = options.toolName || DEFAULT_TOOL;
  const key = options.configKey || UPDATE_CHECK_APPSTASH_KEY;
  const filename = `${key}.json`;
  const dirs = appstash(toolName, { ensure: true });
  ensure(dirs);
  return resolve(dirs, 'config', filename);
}

export function readUpdateConfig(options: ConfigOptions = {}): UpdateCheckConfig | null {
  const configPath = getConfigPath(options);
  try {
    if (!fs.existsSync(configPath)) return null;
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    // Corrupt or unreadable; reset
    try {
      fs.unlinkSync(configPath);
    } catch {
      /* ignore */
    }
    return null;
  }
}

export function writeUpdateConfig(cfg: UpdateCheckConfig, options: ConfigOptions = {}): void {
  const configPath = getConfigPath(options);
  try {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2), 'utf8');
  } catch {
    // fail silently; do not block CLI
  }
}

export function shouldCheck(lastCheckedAt: number | undefined, ttlMs: number, now = Date.now()): boolean {
  if (!lastCheckedAt) return true;
  return now - lastCheckedAt > ttlMs;
}
