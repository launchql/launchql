import fs from 'fs';
import os from 'os';
import path from 'path';
import { readUpdateConfig, resolveUpdateConfigPath, shouldCheck, writeUpdateConfig } from '../utils/update-config';

describe('update-config utilities', () => {
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pgpm-update-config-'));

  afterAll(() => {
    fs.rmSync(baseDir, { recursive: true, force: true });
  });

  it('reads and writes config safely', async () => {
    const config = {
      lastCheckedAt: Date.now(),
      latestKnownVersion: '1.2.3'
    };

    await writeUpdateConfig(config, { baseDir });
    const result = await readUpdateConfig({ baseDir });

    expect(result).toEqual(config);
  });

  it('removes corrupted config files', async () => {
    const configPath = resolveUpdateConfigPath({ baseDir });
    fs.writeFileSync(configPath, 'not-json', 'utf8');

    const result = await readUpdateConfig({ baseDir });
    expect(result).toBeNull();
    expect(fs.existsSync(configPath)).toBe(false);
  });

  it('determines when a check is needed based on TTL', () => {
    const now = Date.now();
    expect(shouldCheck(now, now - 10_000, 1000)).toBe(true);
    expect(shouldCheck(now, now - 500, 1000)).toBe(false);
  });
});
