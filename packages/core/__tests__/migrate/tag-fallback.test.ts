import { mkdtempSync, writeFileSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

jest.mock('../../src/migrate/utils/transaction', () => ({
  withTransaction: async (_pool: any, _opts: any, fn: any) => fn({}),
  executeQuery: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/resolution/deps', () => ({
  resolveDependencies: (): any => ({
    deps: {
      '/deploy/schemas_unique_names_schema.sql': [],
    },
  }),
}));

jest.mock('pg-cache', () => ({
  getPgPool: () => ({
    query: jest
      .fn()
      .mockImplementation((sql: string, params?: any[]) => {
        if (typeof sql === 'string' && sql.includes('SELECT EXISTS')) {
          return Promise.resolve({ rows: [{ exists: true }] });
        }
        if (typeof sql === 'string' && sql.includes('SELECT pgpm_migrate.is_deployed')) {
          return Promise.resolve({ rows: [{ is_deployed: false }] });
        }
        return Promise.resolve({ rows: [] });
      }),
  }),
}));

import { PgpmMigrate } from '../../src/migrate/client';
import { executeQuery } from '../../src/migrate/utils/transaction';

describe('PgpmMigrate.deploy tag fallback bug reproduction', () => {
  it('should not pass tag tokens when resolver returns an empty deps array (expected behavior after fix)', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'lql-core-test-'));
    const packageName = 'unique-names';
    const changeName = 'schemas_unique_names_schema';

    const plan = [
      `%project=${packageName}`,
      `${changeName} [launchql-default-roles:@0.0.5]`,
    ].join('\n');

    mkdirSync(join(dir, 'deploy'), { recursive: true });
    writeFileSync(join(dir, 'pgpm.plan'), plan);
    writeFileSync(join(dir, 'deploy', `${changeName}.sql`), 'select 1;');

    const migrator = new PgpmMigrate(
      { host: 'localhost', port: 5432, user: 'postgres', database: 'postgres' } as any,
      {}
    );

    await migrator.deploy({
      modulePath: dir,
      useTransaction: false,
      logOnly: true,
    } as any);

    const calls = (executeQuery as jest.Mock).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const params = calls[0][2];
    const deps = params[3];

    expect(deps).toBeNull();
  });
});
