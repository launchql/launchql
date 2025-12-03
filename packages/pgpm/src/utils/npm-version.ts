import { execFile } from 'child_process';

export async function fetchLatestVersion(pkgName: string, timeoutMs: number = 5000): Promise<string | null> {
  return new Promise(resolve => {
    const child = execFile('npm', ['view', pkgName, 'version', '--json'], { timeout: timeoutMs }, (err, stdout, stderr) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.warn(`[update-check] npm view failed for ${pkgName}: ${err.message}`);
        if (stderr) {
          // eslint-disable-next-line no-console
          console.warn(`[update-check] npm stderr: ${stderr}`);
        }
        return resolve(null);
      }
      try {
        const trimmed = stdout.trim();
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return resolve(parsed[parsed.length - 1] ?? null);
        }
        if (typeof parsed === 'string') {
          return resolve(parsed);
        }
        // eslint-disable-next-line no-console
        console.warn(`[update-check] npm view returned unexpected payload for ${pkgName}: ${trimmed}`);
        return resolve(null);
      } catch (parseErr) {
        // eslint-disable-next-line no-console
        console.warn(`[update-check] Failed to parse npm view output for ${pkgName}: ${(parseErr as Error).message}`);
        return resolve(null);
      }
    });

    child.on('error', err => {
      // eslint-disable-next-line no-console
      console.warn(`[update-check] npm process error for ${pkgName}: ${err.message}`);
      resolve(null);
    });
  });
}
