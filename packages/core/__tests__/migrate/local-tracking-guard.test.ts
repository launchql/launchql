import { mkdirSync, mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

jest.mock('../../src/migrate/utils/transaction', () => ({
  withTransaction: async (_pool: any, _opts: any, fn: any) => fn({}),
  executeQuery: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('pg-cache', () => ({
  getPgPool: () => ({
    query: jest
      .fn()
      .mockImplementation((sql: string, params?: any[]) => {
        if (typeof sql === 'string' && sql.includes('SELECT EXISTS')) {
          return Promise.resolve({ rows: [{ exists: true }] });
        }
        if (typeof sql === 'string' && sql.includes('SELECT launchql_migrate.is_deployed')) {
          return Promise.resolve({ rows: [{ is_deployed: false }] });
        }
        return Promise.resolve({ rows: [] });
      }),
  }),
}));

import { LaunchQLMigrate } from '../../src/migrate/client';

describe('local tracking guard for deployed/skipped', () => {
  it('normalizes same-package qualified names to unqualified in deployed', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'lql-core-test-'));
    const packageName = 'pkgA';
    const changeName = 'change1';

    const plan = [`%project=${packageName}`, `${changeName}`].join('\n');

    mkdirSync(join(dir, 'deploy'), { recursive: true });
    writeFileSync(join(dir, 'launchql.plan'), plan);
    writeFileSync(join(dir, 'deploy', `${changeName}.sql`), 'select 1;');

    const migrator = new LaunchQLMigrate(
      { host: 'localhost', port: 5432, user: 'postgres', database: 'postgres', password: 'postgres' } as any,
      {}
    );

    const res = await migrator.deploy({
      modulePath: dir,
      useTransaction: false,
      logOnly: true,
    } as any);

    expect(res.deployed).toContain(changeName);
    expect(res.deployed.every((n: string) => !n.includes(':'))).toBe(true);
  });

  it('throws error on cross-package qualified names', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'lql-core-test-'));
    const packageName = 'pkgA';
    const changeName = 'change1';

    const plan = [`%project=${packageName}`, `${changeName}`].join('\n');

    mkdirSync(join(dir, 'deploy'), { recursive: true });
    writeFileSync(join(dir, 'launchql.plan'), plan);
    writeFileSync(join(dir, 'deploy', `${changeName}.sql`), 'select 1;');

    const migrator = new LaunchQLMigrate(
      { host: 'localhost', port: 5432, user: 'postgres', database: 'postgres', password: 'postgres' } as any,
      {}
    );

    expect(() => {
      (migrator as any).toUnqualifiedLocal('pkgA', 'pkgB:change1');
    }).toThrow('Cross-package change encountered in local tracking: pkgB:change1 (current package: pkgA)');
  });
});
