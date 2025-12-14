import fs from 'fs';
import os from 'os';
import path from 'path';
import { Logger } from '@pgpmjs/logger';
import { checkForUpdates } from '../utils/update-check';

const actualNpmVersion = jest.requireActual('../utils/npm-version');
jest.mock('../utils/npm-version', () => {
  const actual = jest.requireActual('../utils/npm-version');
  return {
    ...actual,
    fetchLatestVersion: jest.fn()
  };
});

const fetchLatestVersion = require('../utils/npm-version').fetchLatestVersion as jest.Mock;

describe('checkForUpdates', () => {
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pgpm-update-check-'));
  let warnSpy: jest.SpyInstance;

  beforeAll(() => {
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined as any);
    process.env.CI = 'false';
    delete process.env.PGPM_SKIP_UPDATE_CHECK;
  });

  afterAll(() => {
    warnSpy.mockRestore();
    fs.rmSync(baseDir, { recursive: true, force: true });
  });

  beforeEach(() => {
    warnSpy.mockClear();
    fetchLatestVersion.mockReset();
  });

  it('warns when a newer version is available', async () => {
    fetchLatestVersion.mockResolvedValue('2.0.0');

    const result = await checkForUpdates({
      pkgName: 'pgpm',
      pkgVersion: '1.0.0',
      now: Date.now(),
      baseDir
    });

    expect(result?.latestKnownVersion).toBe('2.0.0');
    expect(warnSpy).toHaveBeenCalled();
  });

  it('warns on every run while a newer version is available', async () => {
    fetchLatestVersion.mockResolvedValue('2.0.0');

    await checkForUpdates({
      pkgName: 'pgpm',
      pkgVersion: '1.0.0',
      now: Date.now(),
      baseDir
    });
    warnSpy.mockClear();

    const second = await checkForUpdates({
      pkgName: 'pgpm',
      pkgVersion: '1.0.0',
      now: Date.now() + 1000,
      baseDir
    });

    expect(second?.latestKnownVersion).toBe('2.0.0');
    expect(warnSpy).toHaveBeenCalled();
  });
});
