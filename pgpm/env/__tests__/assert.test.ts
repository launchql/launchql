import { pgpmDefaults, PgpmOptions } from '@pgpmjs/types';

import {
  assertProductionEnvOptions,
  findUnsafeProductionDefaults
} from '../src/assert';

const prod = { NODE_ENV: 'production' } as NodeJS.ProcessEnv;

// A fully-safe production options object: every sensitive field replaced.
const safeOpts = (): PgpmOptions => ({
  db: {
    rootDb: 'app_root',
    connections: {
      app: { user: 'app_user', password: 's3cret-app' },
      admin: { user: 'app_admin', password: 's3cret-admin' }
    }
  },
  pg: {
    host: 'db.internal',
    port: 5432,
    user: 'postgres',
    password: 's3cret-pg',
    database: 'appdb'
  },
  server: { host: '0.0.0.0' }
});

describe('findUnsafeProductionDefaults', () => {
  it('flags secrets and hosts still left at their built-in defaults', () => {
    const issues = findUnsafeProductionDefaults(pgpmDefaults);
    const joined = issues.join('\n');
    expect(joined).toContain('pg.password');
    expect(joined).toContain('db.connections.app.password');
    expect(joined).toContain('pg.host');
    // Never leak the value itself (paths mention ".password", but never the
    // actual secret/host strings baked into pgpmDefaults).
    expect(joined).not.toContain('app_password');
    expect(joined).not.toContain('admin_password');
    expect(joined).not.toContain('constructive-dev-secret');
    expect(joined).not.toContain('localhost');
  });

  it('reports no issues when every sensitive field is overridden', () => {
    expect(findUnsafeProductionDefaults(safeOpts())).toEqual([]);
  });

  it('ignores fields that are absent (undefined)', () => {
    expect(findUnsafeProductionDefaults({} as PgpmOptions)).toEqual([]);
  });
});

describe('assertProductionEnvOptions', () => {
  it('is a no-op outside production regardless of unsafe defaults', () => {
    expect(() =>
      assertProductionEnvOptions(pgpmDefaults, { NODE_ENV: 'development' } as NodeJS.ProcessEnv)
    ).not.toThrow();
    expect(() =>
      assertProductionEnvOptions(pgpmDefaults, { NODE_ENV: 'test' } as NodeJS.ProcessEnv)
    ).not.toThrow();
  });

  it('warns (does not throw) in production by default', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      expect(() => assertProductionEnvOptions(pgpmDefaults, prod)).not.toThrow();
      expect(spy).toHaveBeenCalledTimes(1);
    } finally {
      spy.mockRestore();
    }
  });

  it('throws in production when STRICT_ENV=throw', () => {
    expect(() =>
      assertProductionEnvOptions(pgpmDefaults, { ...prod, STRICT_ENV: 'throw' })
    ).toThrow(/Unsafe production environment/);
  });

  it('does not throw in production when options are safe, even under STRICT_ENV=throw', () => {
    expect(() =>
      assertProductionEnvOptions(safeOpts(), { ...prod, STRICT_ENV: 'throw' })
    ).not.toThrow();
  });
});
