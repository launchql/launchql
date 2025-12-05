import { execFile } from 'child_process';
import { compareVersions, fetchLatestVersion } from '../utils/npm-version';

jest.mock('child_process', () => ({
  execFile: jest.fn()
}));

const execFileMock = execFile as jest.MockedFunction<typeof execFile>;

describe('npm-version utilities', () => {
  beforeEach(() => {
    execFileMock.mockReset();
  });

  it('parses version output from npm', async () => {
    execFileMock.mockImplementation((_cmd, _args, _opts, cb: any) => {
      cb(null, { stdout: '"2.0.0"', stderr: '' });
      return {} as any;
    });

    const version = await fetchLatestVersion('pgpm');
    expect(version).toBe('2.0.0');
  });

  it('returns null on failure', async () => {
    execFileMock.mockImplementation((_cmd, _args, _opts, cb: any) => {
      cb(new Error('fail'), { stdout: '', stderr: '' });
      return {} as any;
    });

    const version = await fetchLatestVersion('pgpm');
    expect(version).toBeNull();
  });

  it('compares versions using semver when possible', () => {
    expect(compareVersions('1.0.0', '2.0.0')).toBeLessThan(0);
    expect(compareVersions('2.0.0', '1.0.0')).toBeGreaterThan(0);
    expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
  });
});
