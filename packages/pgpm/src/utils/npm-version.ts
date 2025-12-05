import { execFile } from 'child_process';
import semver from 'semver';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function fetchLatestVersion(pkgName: string, timeoutMs = 5000): Promise<string | null> {
  try {
    const result = await execFileAsync('npm', ['view', pkgName, 'version', '--json'], {
      timeout: timeoutMs,
      windowsHide: true,
      maxBuffer: 1024 * 1024
    });

    const stdout = typeof result === 'string'
      ? result
      : (result as any)?.stdout ?? '';

    const parsed = parseVersionOutput(stdout);
    return parsed ?? null;
  } catch {
    return null;
  }
}

const parseVersionOutput = (raw: string): string | null => {
  const trimmed = raw.trim();
  if (!trimmed.length) return null;

  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === 'string') return parsed;
    if (Array.isArray(parsed) && parsed.length) {
      return String(parsed[parsed.length - 1]);
    }
  } catch {
    // fall through to plain string parse
  }

  return trimmed || null;
};

export const compareVersions = (current: string, latest: string): number => {
  const currentSemver = semver.coerce(current);
  const latestSemver = semver.coerce(latest);

  if (currentSemver && latestSemver) {
    return semver.compare(currentSemver, latestSemver);
  }

  return current.localeCompare(latest);
};
