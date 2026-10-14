import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const fixture = join(__dirname, 'fixtures/sequential-runtime.cjs');

describe('sequential readiness with real locked packages and no database', () => {
  it.each(['success', 'schema-failure', 'attachment-failure', 'watch-success', 'watch-retry-success', 'watch-schema-recovery'])(
    'handles %s in strict rejection mode', (scenario) => {
      const result = spawnSync(process.execPath, ['--unhandled-rejections=strict', fixture, scenario], {
        encoding: 'utf8', timeout: 10_000,
      });
      if (result.status !== 0) throw new Error(`${result.error ?? ''}\n${result.stderr}\n${result.stdout}`);
      expect(JSON.parse(result.stdout)).toMatchObject({scenario});
    },
  );

  it.each(['watch-gather-failure', 'watch-schema-failure'])(
    'documents the upstream pending boundary for %s', (scenario) => {
      const result = spawnSync(process.execPath, ['--unhandled-rejections=strict', fixture, scenario], {
        encoding: 'utf8', timeout: 10_000,
      });
      if (result.status !== 0) throw new Error(`${result.error ?? ''}\n${result.stderr}\n${result.stdout}`);
      expect(JSON.parse(result.stdout)).toMatchObject({scenario, pending: true});
    },
  );

  it('detects the upstream watch-startup rejection that readiness cannot observe', () => {
    const result = spawnSync(process.execPath, ['--unhandled-rejections=strict', fixture, 'watch-setup-failure'], {
      encoding: 'utf8', timeout: 10_000,
    });
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('WATCH_SETUP_SENTINEL');
  });
});
